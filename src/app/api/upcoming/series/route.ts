import { NextRequest } from 'next/server';
import { createSearchHandler } from '@/lib/api/searchHandler';

export async function GET(request: NextRequest) {
  return createSearchHandler(request, {
    rateLimitOptions: { windowMs: 60000, maxRequests: 20 },
    apiKeyName: 'TMDB_API_KEY',
    errorMessage: 'Failed to fetch upcoming series',
    fetchFn: async (query, apiKey) => {
      if (!apiKey) throw new Error('TMDB API Key missing');

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

      const discoverUrl = new URL('https://api.themoviedb.org/3/discover/tv');
      discoverUrl.searchParams.set('api_key', apiKey);
      discoverUrl.searchParams.set('language', 'es-ES');
      discoverUrl.searchParams.set('first_air_date.gte', now.toISOString().split('T')[0]);
      discoverUrl.searchParams.set('first_air_date.lte', dateTo.toISOString().split('T')[0]);
      discoverUrl.searchParams.set('sort_by', 'first_air_date.asc');
      discoverUrl.searchParams.set('vote_average.gte', '6');
      discoverUrl.searchParams.set('vote_count.gte', '10');
      discoverUrl.searchParams.set('page', '1');

      const response = await fetch(discoverUrl.toString());
      
      if (!response.ok) {
        throw new Error('TMDB API request failed');
      }

      const data = await response.json();

      const genresResponse = await fetch(
        `https://api.themoviedb.org/3/genre/tv/list?api_key=${apiKey}&language=es-ES`,
        { next: { revalidate: 86400 } }
      );

      const genresData = genresResponse.ok ? await genresResponse.json() : { genres: [] };
      const availableGenres = (genresData.genres || []).map((g: any) => ({
        id: g.id,
        name: g.name,
      }));

      return {
        ...data,
        availableGenres,
      };
    },
  });
}
