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

export async function GET(request: NextRequest) {
  return createSearchHandler(request, {
    errorMessage: 'Failed to search games',
    fetchFn: async (query) => {
      const accessToken = await getIGDBToken();
      const clientId = process.env.IGDB_CLIENT_ID!;

      // IGDB uses a custom query language (body text)
      const response = await fetch('https://api.igdb.com/v4/games', {
        method: 'POST',
        headers: {
          'Client-ID': clientId,
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
        body: `search "${query}"; fields name, cover.url, first_release_date, summary, rating, genres.name; where cover != null; limit 20;`,
      });

      if (!response.ok) throw new Error('IGDB API request failed');

      return response;
    },
  });
}
