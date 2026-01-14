import { NextRequest } from 'next/server';
import { createSearchHandler } from '@/lib/api/searchHandler';

interface TMDBGenre {
  id: number;
  name: string;
}

export async function GET(request: NextRequest) {
  return createSearchHandler(request, {
    apiKeyName: 'TMDB_API_KEY',
    errorMessage: 'Failed to search series',
    fetchFn: async (query, apiKey) => {
      if (!apiKey) throw new Error('TMDB API Key missing');

      // Fetch search results
      const searchResponse = await fetch(
        `https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${encodeURIComponent(query)}&language=es-ES&page=1`,
        { next: { revalidate: 3600 } }
      );

      if (!searchResponse.ok) throw new Error('TMDB API request failed');

      const searchData = await searchResponse.json();

      // Fetch genres list
      const genresResponse = await fetch(
        `https://api.themoviedb.org/3/genre/tv/list?api_key=${apiKey}&language=es-ES`,
        { next: { revalidate: 86400 } }
      );

      const genresData = genresResponse.ok ? await genresResponse.json() : { genres: [] };
      const genreMap = new Map(
        (genresData.genres as TMDBGenre[]).map((g) => [g.id, g.name])
      );

      // Enrich results with genre names
      const enrichedResults = (searchData.results || []).map((series: any) => ({
        ...series,
        genre_names:
          series.genre_ids
            ?.map((id: number) => genreMap.get(id))
            .filter(Boolean) || [],
      }));

      return Response.json({
        ...searchData,
        results: enrichedResults,
      });
    },
  });
}
