import { NextRequest } from 'next/server';
import { createSearchHandler } from '@/lib/api/searchHandler';

// Token cache to avoid unnecessary requests
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getIGDBToken(): Promise<string> {
  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'IGDB Credentials missing. Please add IGDB_CLIENT_ID and IGDB_CLIENT_SECRET to .env.local'
    );
  }

  // Reuse token if still valid
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const response = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    { method: 'POST' }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Twitch Token Error:', response.status, errorText);
    throw new Error(`Failed to get IGDB token: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  // Cache token (expires_in is in seconds, we subtract 60s buffer)
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return data.access_token;
}

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
      const clientId = process.env.IGDB_CLIENT_ID!;

      if (sanitizedQuery.length < 1) {
        throw new Error('Query must be at least 1 character after sanitization');
      }

      const [strictResults, broadResults] = await Promise.all([
        fetch('https://api.igdb.com/v4/games', {
          method: 'POST',
          headers: {
            'Client-ID': clientId,
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
          },
          body: `search "${sanitizedQuery}"; fields name, cover.url, first_release_date, summary, rating, genres.name; where cover != null; limit 10;`,
        }),
        fetch('https://api.igdb.com/v4/games', {
          method: 'POST',
          headers: {
            'Client-ID': clientId,
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
          },
          body: `fields name, cover.url, first_release_date, summary, rating, genres.name; where name ~ "*${sanitizedQuery}*" & cover != null; limit 20;`,
        })
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
