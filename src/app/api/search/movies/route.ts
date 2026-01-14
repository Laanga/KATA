import { NextRequest } from 'next/server';
import { rateLimit, getClientIdentifier } from '@/lib/utils/rateLimit';

// Rate limit: 10 requests per minute per IP
const RATE_LIMIT_OPTIONS = { windowMs: 60000, maxRequests: 10 };

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
                    'X-RateLimit-Reset': new Date(limitResult.resetTime).toISOString(),
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

    // Sanitize query: remove dangerous characters and limit length
    const sanitizedQuery = query.trim().slice(0, 100);
    if (sanitizedQuery.length < 1) {
        return Response.json({ error: 'Query must be at least 1 character' }, { status: 400 });
    }

    // TODO: Add TMDB_API_KEY to your .env.local file
    const apiKey = process.env.TMDB_API_KEY;

    if (!apiKey) {
        return Response.json({ error: 'TMDB API Key missing. Please add TMDB_API_KEY to .env.local' }, { status: 500 });
    }

    try {
        // Primero obtener los resultados de búsqueda
        const searchResponse = await fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(sanitizedQuery)}&language=es-ES&page=1`,
            { next: { revalidate: 3600 } }
        );

        if (!searchResponse.ok) {
            throw new Error('TMDB API request failed');
        }

        const searchData = await searchResponse.json();

        // Obtener lista de géneros de películas
        const genresResponse = await fetch(
            `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=es-ES`,
            { next: { revalidate: 86400 } } // Cache for 24 hours
        );

        const genresData = await genresResponse.ok ? await genresResponse.json() : { genres: [] };
        const genreMap = new Map(genresData.genres.map((g: any) => [g.id, g.name]));

        // Enriquecer resultados con nombres de géneros
        const enrichedResults = searchData.results?.map((movie: any) => ({
            ...movie,
            genre_names: movie.genre_ids?.map((id: number) => genreMap.get(id)).filter(Boolean) || []
        })) || [];

        return Response.json({
            ...searchData,
            results: enrichedResults
        }, {
            headers: {
                'X-RateLimit-Limit': RATE_LIMIT_OPTIONS.maxRequests.toString(),
                'X-RateLimit-Remaining': limitResult.remaining.toString(),
            }
        });
    } catch (error) {
        console.error('Movies search error:', error);
        return Response.json(
            { error: 'Failed to search movies' },
            { status: 500 }
        );
    }
}
