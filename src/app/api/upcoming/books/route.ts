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

  const currentYear = new Date().getFullYear();

  // Intentar primero con Google Books
  const googleResults = await fetchFromGoogleBooks(currentYear);
  
  if (googleResults.length > 0) {
    return NextResponse.json({
      results: googleResults,
      availableGenres: getBookGenres(),
    });
  }

  // Fallback a Open Library
  const openLibraryResults = await fetchFromOpenLibrary(currentYear);
  
  return NextResponse.json({
    results: openLibraryResults,
    availableGenres: getBookGenres(),
  });
}

async function fetchFromGoogleBooks(currentYear: number): Promise<any[]> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  
  // Queries para encontrar libros recientes
  const queries = [
    'subject:fiction',
    'subject:thriller',
    'subject:fantasy',
    'subject:romance',
  ];

  try {
    const allResults: any[] = [];

    for (const query of queries) {
      const googleUrl = new URL('https://www.googleapis.com/books/v1/volumes');
      googleUrl.searchParams.set('q', query);
      googleUrl.searchParams.set('orderBy', 'newest');
      googleUrl.searchParams.set('printType', 'books');
      googleUrl.searchParams.set('langRestrict', 'es');
      googleUrl.searchParams.set('maxResults', '15');
      
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
            return pubYear >= currentYear - 1;
          })
          .filter((book: any) => book.volumeInfo?.imageLinks?.thumbnail);

        allResults.push(...filtered);
      }
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
        return dateB.localeCompare(dateA); // Descendente para libros (más recientes)
      })
      .slice(0, 20);

    return sortedResults.map((book: any) => ({
      id: book.id,
      volumeInfo: book.volumeInfo,
    }));
  } catch (error) {
    console.error('Error fetching from Google Books:', error);
    return [];
  }
}

async function fetchFromOpenLibrary(currentYear: number): Promise<any[]> {
  try {
    // Open Library - buscar libros recientes
    const response = await fetch(
      `https://openlibrary.org/search.json?q=*&sort=new&limit=30&language=spa`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    return (data.docs || [])
      .filter((book: any) => {
        const pubYear = book.first_publish_year;
        return pubYear && pubYear >= currentYear - 1;
      })
      .filter((book: any) => book.cover_i) // Solo con portada
      .sort((a: any, b: any) => {
        // Ordenar por año de publicación descendente (más reciente primero)
        return (b.first_publish_year || 0) - (a.first_publish_year || 0);
      })
      .slice(0, 20)
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
  } catch (error) {
    console.error('Error fetching from Open Library:', error);
    return [];
  }
}

function getBookGenres() {
  return [
    { id: 'Fiction', name: 'Ficción' },
    { id: 'Fantasy', name: 'Fantasía' },
    { id: 'Science Fiction', name: 'Ciencia Ficción' },
    { id: 'Mystery', name: 'Misterio' },
    { id: 'Thriller', name: 'Thriller' },
    { id: 'Romance', name: 'Romance' },
    { id: 'Horror', name: 'Terror' },
    { id: 'Biography', name: 'Biografía' },
    { id: 'History', name: 'Historia' },
    { id: 'Self-Help', name: 'Autoayuda' },
  ];
}
