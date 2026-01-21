import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIdentifier } from '@/lib/utils/rateLimit';

export async function GET(request: NextRequest) {
  const identifier = getClientIdentifier(request);
  const limitResult = rateLimit(identifier, { windowMs: 60000, maxRequests: 20 });

  if (!limitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'TMDB API Key missing' },
      { status: 500 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const period = searchParams.get('period') || 'month';

  const now = new Date();
  let daysToAdd: number;
  
  switch (period) {
    case 'week':
      daysToAdd = 7;
      break;
    case 'quarter':
      daysToAdd = 90;
      break;
    case 'month':
    default:
      daysToAdd = 30;
      break;
  }

  const dateTo = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

  try {
    const discoverUrl = new URL('https://api.themoviedb.org/3/discover/movie');
    discoverUrl.searchParams.set('api_key', apiKey);
    discoverUrl.searchParams.set('language', 'es-ES');
    discoverUrl.searchParams.set('region', 'ES');
    discoverUrl.searchParams.set('primary_release_date.gte', now.toISOString().split('T')[0]);
    discoverUrl.searchParams.set('primary_release_date.lte', dateTo.toISOString().split('T')[0]);
    discoverUrl.searchParams.set('sort_by', 'primary_release_date.asc');
    discoverUrl.searchParams.set('page', '1');

    const response = await fetch(discoverUrl.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('TMDB API Error:', errorText);
      return NextResponse.json(
        { error: 'TMDB API request failed' },
        { status: 500 }
      );
    }

    const data = await response.json();

    // Obtener géneros
    const genresResponse = await fetch(
      `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=es-ES`
    );

    const genresData = genresResponse.ok ? await genresResponse.json() : { genres: [] };
    const availableGenres = (genresData.genres || []).map((g: any) => ({
      id: g.id,
      name: g.name,
    }));

    return NextResponse.json({
      results: data.results || [],
      availableGenres,
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movies' },
      { status: 500 }
    );
  }
}
