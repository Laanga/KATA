import { providerFetch } from '@/lib/api/providerFetch';
import type { TMDBGenre, TMDBMovie } from '@/types/api';
import { NextRequest, NextResponse } from 'next/server';
import { authorizeApi } from '@/lib/api/authorize';

export async function GET(request: NextRequest) {
  const denied = await authorizeApi();
  if (denied) return denied;

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'TMDB API Key missing' }, { status: 500 });
  }

  const searchParams = request.nextUrl.searchParams;
  const period = searchParams.get('period') || 'month';
  const genre = searchParams.get('genre');

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

    // Filtrar por género si se especifica
    if (genre && genre !== 'ALL') {
      discoverUrl.searchParams.set('with_genres', genre);
    }

    const response = await providerFetch(discoverUrl.toString());

    if (!response.ok) {
      const errorText = await response.text();
      console.error('TMDB API Error:', errorText);
      return NextResponse.json({ error: 'TMDB API request failed' }, { status: 500 });
    }

    const data = await response.json();

    // Obtener géneros
    const genresResponse = await providerFetch(
      `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=es-ES`,
    );

    const genresData = genresResponse.ok ? await genresResponse.json() : { genres: [] };
    const availableGenres = (genresData.genres || []).map((g: TMDBGenre) => ({
      id: g.id,
      name: g.name,
    }));

    return NextResponse.json({
      results: (data.results || []).filter((item: TMDBMovie) => item.poster_path),
      availableGenres,
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
    return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 });
  }
}
