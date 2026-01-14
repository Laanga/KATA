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

    // Google Books API Key is optional for low usage, but recommended
    // TODO: Add GOOGLE_BOOKS_API_KEY to your .env.local file if you hit rate limits
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    const keyParam = apiKey ? `&key=${apiKey}` : '';

    try {
        const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(sanitizedQuery)}&maxResults=20${keyParam}`,
            { next: { revalidate: 3600 } }
        );

        if (!response.ok) {
            throw new Error('Google Books API request failed');
        }

        const data = await response.json();
        
        // Enriquecer resultados con categorías como géneros
        const enrichedItems = data.items?.map((item: any) => {
            const categories = item.volumeInfo?.categories || item.volumeInfo?.subject || [];
            return {
                ...item,
                volumeInfo: {
                    ...item.volumeInfo,
                    genre_names: Array.isArray(categories) ? categories : [categories].filter(Boolean)
                }
            };
        }) || [];

        return Response.json({
            ...data,
            items: enrichedItems
        }, {
            headers: {
                'X-RateLimit-Limit': RATE_LIMIT_OPTIONS.maxRequests.toString(),
                'X-RateLimit-Remaining': limitResult.remaining.toString(),
            }
        });
    } catch (error) {
        console.error('Books search error:', error);
        return Response.json(
            { error: 'Failed to search books' },
            { status: 500 }
        );
    }
}
