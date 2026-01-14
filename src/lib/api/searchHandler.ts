import { NextRequest } from 'next/server';
import { rateLimit, getClientIdentifier } from '@/lib/utils/rateLimit';

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

interface SearchHandlerConfig {
  rateLimitOptions?: RateLimitOptions;
  apiKeyName?: string;
  fetchFn: (query: string, apiKey?: string) => Promise<Response>;
  errorMessage: string;
}

export async function createSearchHandler(
  request: NextRequest,
  config: SearchHandlerConfig
): Promise<Response> {
  const {
    rateLimitOptions = { windowMs: 60000, maxRequests: 10 },
    apiKeyName,
    fetchFn,
    errorMessage,
  } = config;

  // Rate limiting
  const identifier = getClientIdentifier(request);
  const limitResult = rateLimit(identifier, rateLimitOptions);

  if (!limitResult.allowed) {
    return Response.json(
      {
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((limitResult.resetTime - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil(
            (limitResult.resetTime - Date.now()) / 1000
          ).toString(),
          'X-RateLimit-Limit': rateLimitOptions.maxRequests.toString(),
          'X-RateLimit-Remaining': limitResult.remaining.toString(),
        },
      }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  // Validation
  if (!query || typeof query !== 'string') {
    return Response.json(
      { error: 'Query parameter required' },
      { status: 400 }
    );
  }

  // Sanitize query
  const sanitizedQuery = query.trim().slice(0, 100);
  if (sanitizedQuery.length < 1) {
    return Response.json(
      { error: 'Query must be at least 1 character' },
      { status: 400 }
    );
  }

  // Check API key if required
  const apiKey = apiKeyName ? process.env[apiKeyName] : undefined;
  if (apiKeyName && !apiKey) {
    return Response.json(
      {
        error: `${apiKeyName} missing. Please add ${apiKeyName} to .env.local`,
      },
      { status: 500 }
    );
  }

  try {
    const response = await fetchFn(sanitizedQuery, apiKey);

    // Add rate limit headers
    const headers = new Headers(response.headers);
    headers.set('X-RateLimit-Limit', rateLimitOptions.maxRequests.toString());
    headers.set(
      'X-RateLimit-Remaining',
      limitResult.remaining.toString()
    );

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    return Response.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
