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
    return NextResponse.json({ results: [] });
  }

  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'movie'; // movie o tv
  const genres = searchParams.get('genres') || ''; // IDs separados por coma
  const exclude = searchParams.get('exclude') || ''; // Títulos a excluir separados por coma

  const excludeTitles = exclude.split(',').filter(Boolean).map(t => t.toLowerCase().trim());

  try {
    const endpoint = type === 'tv' ? 'discover/tv' : 'discover/movie';
    const discoverUrl = new URL(`https://api.themoviedb.org/3/${endpoint}`);
    discoverUrl.searchParams.set('api_key', apiKey);
    discoverUrl.searchParams.set('language', 'es-ES');
    discoverUrl.searchParams.set('sort_by', 'popularity.desc');
    discoverUrl.searchParams.set('vote_average.gte', '7');
    discoverUrl.searchParams.set('vote_count.gte', '100');
    discoverUrl.searchParams.set('page', '1');
    
    if (genres) {
      discoverUrl.searchParams.set('with_genres', genres);
    }

    const response = await fetch(discoverUrl.toString());
    
    if (!response.ok) {
      return NextResponse.json({ results: [] });
    }

    const data = await response.json();
    
    // Filtrar títulos que el usuario ya tiene
    const filteredResults = (data.results || []).filter((item: any) => {
      const title = (item.title || item.name || '').toLowerCase();
      return !excludeTitles.some(excluded => title.includes(excluded) || excluded.includes(title));
    }).slice(0, 10);

    return NextResponse.json({
      results: filteredResults,
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json({ results: [] });
  }
}
