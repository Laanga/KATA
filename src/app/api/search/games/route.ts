import { providerFetch } from '@/lib/api/providerFetch';
import { getIGDBToken } from '@/lib/api/igdb';
import { NextRequest } from 'next/server';
import { createSearchHandler } from '@/lib/api/searchHandler';

function sanitizeQuery(query: string): string {
  return query
    .replace(/"/g, '')
    .replace(/;/g, '')
    .replace(/"/g, '')
    .replace(/'/g, '')
    .replace(/`/g, '')
    .replace(/\\/g, '')
    .trim()
    .slice(0, 100);
}

export async function GET(request: NextRequest) {
  return createSearchHandler(request, {
    errorMessage: 'Failed to search games',
    fetchFn: async (query) => {
      const sanitizedQuery = sanitizeQuery(query);
      const accessToken = await getIGDBToken();
      if (!accessToken) throw new Error('El catálogo de juegos no está disponible');
      const clientId = process.env.IGDB_CLIENT_ID!;

      if (sanitizedQuery.length < 1) {
        throw new Error('Query must be at least 1 character after sanitization');
      }

      const [strictResults, broadResults] = await Promise.all([
        providerFetch('https://api.igdb.com/v4/games', {
          method: 'POST',
          headers: {
            'Client-ID': clientId,
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
          body: `search "${sanitizedQuery}"; fields name, cover.url, first_release_date, summary, rating, genres.name; where cover != null; limit 10;`,
        }),
        providerFetch('https://api.igdb.com/v4/games', {
          method: 'POST',
          headers: {
            'Client-ID': clientId,
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
          body: `fields name, cover.url, first_release_date, summary, rating, genres.name; where name ~ "*${sanitizedQuery}*" & cover != null; limit 20;`,
        }),
      ]);

      if (!strictResults.ok || !broadResults.ok) {
        const errorText = strictResults.ok ? await broadResults.text() : await strictResults.text();
        console.error('IGDB API Error:', strictResults.status, errorText);
        throw new Error(`IGDB API request failed: ${strictResults.status} ${errorText}`);
      }

      const strictData = await strictResults.json();
      const broadData = await broadResults.json();

      const seenIds = new Set();
      const mergedResults = [];

      for (const game of strictData || []) {
        if (!seenIds.has(game.id)) {
          seenIds.add(game.id);
          mergedResults.push(game);
        }
      }

      for (const game of broadData || []) {
        if (!seenIds.has(game.id)) {
          seenIds.add(game.id);
          mergedResults.push(game);
        }
      }

      return Response.json(mergedResults.slice(0, 20));
    },
  });
}
