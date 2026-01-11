import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
        return Response.json({ error: 'Query parameter required' }, { status: 400 });
    }

    // TODO: Add TMDB_API_KEY to your .env.local file
    const apiKey = process.env.TMDB_API_KEY;

    if (!apiKey) {
        return Response.json({ error: 'TMDB API Key missing. Please add TMDB_API_KEY to .env.local' }, { status: 500 });
    }

    try {
        const response = await fetch(
            `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=es-ES&page=1`,
            { next: { revalidate: 3600 } } // Cache for 1 hour
        );

        if (!response.ok) {
            throw new Error('TMDB API request failed');
        }

        const data = await response.json();
        return Response.json(data);
    } catch (error) {
        console.error('Movies search error:', error);
        return Response.json(
            { error: 'Failed to search movies' },
            { status: 500 }
        );
    }
}
