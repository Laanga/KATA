import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIdentifier } from '@/lib/utils/rateLimit';

export async function GET(request: NextRequest) {
  const identifier = getClientIdentifier(request);
  const limitResult = rateLimit(identifier, { windowMs: 60000, maxRequests: 20 });

  if (!limitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const genre = searchParams.get('genre');
  const period = searchParams.get('period') || 'month';

  // Para libros, usamos el período para determinar qué tan recientes deben ser
  let yearsBack: number;
  switch (period) {
    case 'week':
      yearsBack = 0; // Solo este año
      break;
    case 'quarter':
      yearsBack = 2; // Últimos 2 años
      break;
    case 'month':
    default:
      yearsBack = 1; // Último año
      break;
  }

  const currentYear = new Date().getFullYear();
  const minYear = currentYear - yearsBack;

  // Intentar primero con Google Books
  const googleResults = await fetchFromGoogleBooks(minYear, currentYear, genre);
  
  if (googleResults.length > 0) {
    return NextResponse.json({
      results: googleResults,
      availableGenres: getBookGenres(),
    });
  }

  // Fallback a Open Library
  const openLibraryResults = await fetchFromOpenLibrary(minYear, genre);
  
  return NextResponse.json({
    results: openLibraryResults,
    availableGenres: getBookGenres(),
  });
}

async function fetchFromGoogleBooks(minYear: number, maxYear: number, genre?: string | null): Promise<any[]> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  
  // Determinar queries según género
  let queries: string[];
  
  if (genre && genre !== 'ALL') {
    // Buscar por el género específico
    queries = [`subject:${genre.toLowerCase()}`];
  } else {
    // Queries variadas para obtener diversidad
    queries = [
      'subject:fiction',
      'subject:thriller',
      'subject:fantasy',
      'subject:mystery',
      'subject:romance',
      'subject:science+fiction',
    ];
  }

  try {
    const allResults: any[] = [];

    for (const query of queries) {
      const googleUrl = new URL('https://www.googleapis.com/books/v1/volumes');
      googleUrl.searchParams.set('q', query);
      googleUrl.searchParams.set('orderBy', 'newest');
      googleUrl.searchParams.set('printType', 'books');
      googleUrl.searchParams.set('maxResults', '20');
      // No restringir idioma para obtener más resultados
      
      if (apiKey) {
        googleUrl.searchParams.set('key', apiKey);
      }

      const response = await fetch(googleUrl.toString());

      if (response.ok) {
        const data = await response.json();
        
        const filtered = (data.items || [])
          .filter((book: any) => {
            const publishedDate = book.volumeInfo?.publishedDate;
            if (!publishedDate) return false;
            const pubYear = parseInt(publishedDate.substring(0, 4));
            return pubYear >= minYear && pubYear <= maxYear;
          })
          .filter((book: any) => {
            // Debe tener imagen
            return book.volumeInfo?.imageLinks?.thumbnail || book.volumeInfo?.imageLinks?.smallThumbnail;
          });

        allResults.push(...filtered);
      }

      // Pequeña pausa entre requests para no saturar
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Eliminar duplicados por ID
    const uniqueResults = Array.from(
      new Map(allResults.map(book => [book.id, book])).values()
    );

    // Ordenar por fecha de publicación (más reciente primero)
    const sortedResults = uniqueResults
      .sort((a: any, b: any) => {
        const dateA = a.volumeInfo?.publishedDate || '';
        const dateB = b.volumeInfo?.publishedDate || '';
        return dateB.localeCompare(dateA);
      })
      .slice(0, 30);

    return sortedResults.map((book: any) => ({
      id: book.id,
      volumeInfo: book.volumeInfo,
    }));
  } catch (error) {
    console.error('Error fetching from Google Books:', error);
    return [];
  }
}

async function fetchFromOpenLibrary(minYear: number, genre?: string | null): Promise<any[]> {
  try {
    // Open Library - buscar libros recientes y populares
    let url: string;
    
    if (genre && genre !== 'ALL') {
      // Buscar por subject/género
      url = `https://openlibrary.org/subjects/${genre.toLowerCase()}.json?limit=40`;
    } else {
      // Buscar libros populares/trending
      url = `https://openlibrary.org/trending/daily.json?limit=40`;
    }
    
    const response = await fetch(url);

    if (!response.ok) {
      // Fallback a búsqueda general
      const searchUrl = `https://openlibrary.org/search.json?q=${genre || 'fiction'}&sort=new&limit=40`;
      const searchResponse = await fetch(searchUrl);
      
      if (!searchResponse.ok) return [];
      
      const searchData = await searchResponse.json();
      return processOpenLibrarySearch(searchData.docs || [], minYear);
    }

    const data = await response.json();
    
    // El formato varía según el endpoint
    if (data.works) {
      // Formato de /subjects/
      return processOpenLibraryWorks(data.works, minYear);
    } else if (data.docs) {
      // Formato de search
      return processOpenLibrarySearch(data.docs, minYear);
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching from Open Library:', error);
    return [];
  }
}

function processOpenLibraryWorks(works: any[], minYear: number): any[] {
  return works
    .filter((work: any) => {
      const pubYear = work.first_publish_year;
      return !pubYear || pubYear >= minYear; // Incluir si no tiene año o es reciente
    })
    .filter((work: any) => work.cover_id || work.cover_i)
    .slice(0, 30)
    .map((work: any) => ({
      id: work.key,
      volumeInfo: {
        title: work.title,
        authors: work.authors?.map((a: any) => a.name) || [],
        publishedDate: work.first_publish_year?.toString(),
        categories: work.subject?.slice(0, 3),
        imageLinks: {
          thumbnail: `https://covers.openlibrary.org/b/id/${work.cover_id || work.cover_i}-M.jpg`,
        },
      },
    }));
}

function processOpenLibrarySearch(docs: any[], minYear: number): any[] {
  return docs
    .filter((book: any) => {
      const pubYear = book.first_publish_year;
      return !pubYear || pubYear >= minYear;
    })
    .filter((book: any) => book.cover_i)
    .slice(0, 30)
    .map((book: any) => ({
      id: book.key,
      volumeInfo: {
        title: book.title,
        authors: book.author_name,
        publishedDate: book.first_publish_year?.toString(),
        categories: book.subject?.slice(0, 3),
        imageLinks: {
          thumbnail: `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`,
        },
      },
    }));
}

function getBookGenres() {
  return [
    { id: 'fiction', name: 'Ficción' },
    { id: 'fantasy', name: 'Fantasía' },
    { id: 'science_fiction', name: 'Ciencia Ficción' },
    { id: 'mystery', name: 'Misterio' },
    { id: 'thriller', name: 'Thriller' },
    { id: 'romance', name: 'Romance' },
    { id: 'horror', name: 'Terror' },
    { id: 'biography', name: 'Biografía' },
    { id: 'history', name: 'Historia' },
    { id: 'young_adult', name: 'Juvenil' },
    { id: 'comics', name: 'Cómics' },
    { id: 'poetry', name: 'Poesía' },
  ];
}
