import { NextRequest } from 'next/server';
import { createSearchHandler } from '@/lib/api/searchHandler';

export async function GET(request: NextRequest) {
  return createSearchHandler(request, {
    errorMessage: 'Failed to search books',
    fetchFn: async (query) => {
      const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
      const keyParam = apiKey ? `&key=${apiKey}` : '';

      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20${keyParam}`,
        { next: { revalidate: 3600 } }
      );

      if (!response.ok) throw new Error('Google Books API request failed');

      const data = await response.json();

      // Enrich results with categories as genres
      const enrichedItems = (data.items || []).map((item: any) => {
        const categories =
          item.volumeInfo?.categories || item.volumeInfo?.subject || [];
        return {
          ...item,
          volumeInfo: {
            ...item.volumeInfo,
            genre_names: Array.isArray(categories)
              ? categories
              : ([categories].filter(Boolean) as string[]),
          },
        };
      });

      return Response.json({
        ...data,
        items: enrichedItems,
      });
    },
  });
}
