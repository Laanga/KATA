import { NextRequest } from 'next/server';
import { authorizeApi } from './authorize';

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
  config: SearchHandlerConfig,
): Promise<Response> {
  const { apiKeyName, fetchFn, errorMessage } = config;

  const denied = await authorizeApi();
  if (denied) return denied;

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

  // Check API key if required
  const apiKey = apiKeyName ? process.env[apiKeyName] : undefined;
  if (apiKeyName && !apiKey) {
    return Response.json(
      {
        error: 'Este catálogo no está disponible temporalmente.',
      },
      { status: 500 },
    );
  }

  try {
    const response = await fetchFn(sanitizedQuery, apiKey);

    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'private, no-store');
    return new Response(response.body, { status: response.status, headers });
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
