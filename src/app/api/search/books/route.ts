import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
        return Response.json({ error: 'Query parameter required' }, { status: 400 });
    }

    // Google Books API Key is optional for low usage, but recommended
    // TODO: Add GOOGLE_BOOKS_API_KEY to your .env.local file if you hit rate limits
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    const keyParam = apiKey ? `&key=${apiKey}` : '';

    try {
        const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20${keyParam}`,
            { next: { revalidate: 3600 } }
        );

        if (!response.ok) {
            throw new Error('Google Books API request failed');
        }

        const data = await response.json();
        return Response.json(data);
    } catch (error) {
        console.error('Books search error:', error);
        return Response.json(
            { error: 'Failed to search books' },
            { status: 500 }
        );
    }
}
