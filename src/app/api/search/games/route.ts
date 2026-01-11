import { NextRequest } from 'next/server';

// Token cache to avoid unnecessary requests
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getIGDBToken(): Promise<string> {
    // TODO: Add IGDB_CLIENT_ID and IGDB_CLIENT_SECRET to your .env.local file
    const clientId = process.env.IGDB_CLIENT_ID;
    const clientSecret = process.env.IGDB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error('IGDB Credentials missing. Please add IGDB_CLIENT_ID and IGDB_CLIENT_SECRET to .env.local');
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
        expiresAt: Date.now() + (data.expires_in - 60) * 1000
    };

    return data.access_token;
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
        return Response.json({ error: 'Query parameter required' }, { status: 400 });
    }

    try {
        const accessToken = await getIGDBToken();
        const clientId = process.env.IGDB_CLIENT_ID!;

        // IGDB uses a custom query language (body text)
        // We search for games, getting name, summary, cover, first_release_date
        const response = await fetch('https://api.igdb.com/v4/games', {
            method: 'POST',
            headers: {
                'Client-ID': clientId,
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
            },
            body: `search "${query}"; fields name, cover.url, first_release_date, summary, rating, genres.name; where cover != null; limit 20;`
        });

        if (!response.ok) {
            throw new Error('IGDB API request failed');
        }

        const data = await response.json();
        return Response.json(data);
    } catch (error) {
        console.error('Games search error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to search games';
        return Response.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
