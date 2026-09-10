import { NextRequest } from 'next/server';
import { createSearchHandler } from '@/lib/api/searchHandler';
import { providerFetch } from '@/lib/api/providerFetch';
import type { GoogleBookVolume, OpenLibraryWork } from '@/types/api';
export async function GET(request: NextRequest) {
  return createSearchHandler(request, {
    errorMessage: 'No pudimos buscar libros. Inténtalo de nuevo.',
    fetchFn: async (query) => {
      const url = new URL('https://www.googleapis.com/books/v1/volumes');
      url.searchParams.set('q', query);
      url.searchParams.set('maxResults', '20');
      if (process.env.GOOGLE_BOOKS_API_KEY)
        url.searchParams.set('key', process.env.GOOGLE_BOOKS_API_KEY);
      try {
        const response = await providerFetch(url, { next: { revalidate: 3600 } });
        if (response.ok) {
          const data = await response.json();
          return Response.json({
            items: (data.items || []).map((item: GoogleBookVolume) => ({
              ...item,
              volumeInfo: { ...item.volumeInfo, genre_names: item.volumeInfo?.categories || [] },
            })),
          });
        }
      } catch {
        /* Fall back to Open Library if Google is unavailable. */
      }
      const fallback = new URL('https://openlibrary.org/search.json');
      fallback.searchParams.set('q', query);
      fallback.searchParams.set('limit', '20');
      fallback.searchParams.set(
        'fields',
        'key,title,author_name,first_publish_year,cover_i,subject',
      );
      const response = await providerFetch(fallback, { next: { revalidate: 3600 } });
      if (!response.ok) throw new Error('Book providers unavailable');
      const data = await response.json();
      return Response.json({
        items: (data.docs || []).map((book: OpenLibraryWork) => ({
          id: book.key,
          provider: 'openlibrary',
          volumeInfo: {
            title: book.title,
            authors: book.author_name,
            publishedDate: book.first_publish_year?.toString(),
            categories: book.subject?.slice(0, 5),
            imageLinks: book.cover_i
              ? { thumbnail: `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` }
              : undefined,
          },
        })),
      });
    },
  });
}
