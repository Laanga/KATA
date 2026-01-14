import { NextRequest } from 'next/server';
import { rateLimit, getClientIdentifier } from '@/lib/utils/rateLimit';

// Rate limit: 10 requests per minute per IP
const RATE_LIMIT_OPTIONS = { windowMs: 60000, maxRequests: 10 };

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
    // Rate limiting
    const identifier = getClientIdentifier(request);
    const limitResult = rateLimit(identifier, RATE_LIMIT_OPTIONS);
    
    if (!limitResult.allowed) {
        return Response.json(
            { 
                error: 'Too many requests. Please try again later.',
                retryAfter: Math.ceil((limitResult.resetTime - Date.now()) / 1000)
            },
            { 
                status: 429,
                headers: {
                    'Retry-After': Math.ceil((limitResult.resetTime - Date.now()) / 1000).toString(),
                    'X-RateLimit-Limit': RATE_LIMIT_OPTIONS.maxRequests.toString(),
                    'X-RateLimit-Remaining': limitResult.remaining.toString(),
                }
            }
        );
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    // Validation
    if (!query || typeof query !== 'string') {
        return Response.json({ error: 'Query parameter required' }, { status: 400 });
    }

    // Sanitize query
    const sanitizedQuery = query.trim().slice(0, 100);
    if (sanitizedQuery.length < 1) {
        return Response.json({ error: 'Query must be at least 1 character' }, { status: 400 });
    }

    try {
        const accessToken = await getIGDBToken();
        const clientId = process.env.IGDB_CLIENT_ID!;

        // IGDB uses a custom query language (body text)
        // We search for games, getting name, summary, cover, first_release_date, genres
        const response = await fetch('https://api.igdb.com/v4/games', {
            method: 'POST',
            headers: {
                'Client-ID': clientId,
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
            },
            body: `search "${sanitizedQuery}"; fields name, cover.url, first_release_date, summary, rating, genres.name; where cover != null; limit 20;`
        });

        if (!response.ok) {
            throw new Error('IGDB API request failed');
        }

        const data = await response.json();
        return Response.json(data, {
            headers: {
                'X-RateLimit-Limit': RATE_LIMIT_OPTIONS.maxRequests.toString(),
                'X-RateLimit-Remaining': limitResult.remaining.toString(),
            }
        });
    } catch (error) {
        console.error('Games search error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to search games';
        return Response.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
