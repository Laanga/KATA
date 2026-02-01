import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIdentifier } from '@/lib/utils/rateLimit';
import type { TMDBMovie, TMDBSeries, IGDBGame, RAWGGame, GoogleBookVolume } from '@/types/api';

let igdbTokenCache: { token: string; expiresAt: number; fetchedAt: number } | null = null;
let tokenPromise: Promise<string | null> | null = null;

async function getIGDBToken(): Promise<string | null> {
  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('[IGDB] Missing credentials');
    return null;
  }

  const now = Date.now();

  if (igdbTokenCache && now < igdbTokenCache.expiresAt - 300000) {
    return igdbTokenCache.token;
  }

  if (tokenPromise) {
    return tokenPromise;
  }

  tokenPromise = fetchNewToken(clientId, clientSecret, now);

  try {
    const token = await tokenPromise;
    return token;
  } finally {
    tokenPromise = null;
  }
}

async function fetchNewToken(
  clientId: string,
  clientSecret: string,
  now: number
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
      {
        method: 'POST',
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      console.error(`[IGDB] Token fetch failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    const expiresAt = now + (data.expires_in - 300) * 1000;

    igdbTokenCache = {
      token: data.access_token,
      expiresAt,
      fetchedAt: now,
    };

    console.log(`[IGDB] New token cached, expires at ${new Date(expiresAt).toISOString()}`);

    return data.access_token;
  } catch (error) {
    console.error('[IGDB] Error fetching token:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const identifier = getClientIdentifier(request);
  const limitResult = rateLimit(identifier, { windowMs: 60000, maxRequests: 20 });

  if (!limitResult.allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'movie'; // movie, tv, game, book
  const genres = searchParams.get('genres') || '';
  const exclude = searchParams.get('exclude') || '';
  const daySeed = parseInt(searchParams.get('daySeed') || '1');

  const excludeTitles = exclude.split(',').filter(Boolean).map(t => t.toLowerCase().trim());

  // Redirigir según el tipo
  switch (type) {
    case 'movie':
    case 'tv':
      return await fetchTMDBRecommendations(type, genres, excludeTitles, daySeed);
    case 'game':
      return await fetchGameRecommendations(genres, excludeTitles, daySeed);
    case 'book':
      return await fetchBookRecommendations(genres, excludeTitles, daySeed);
    default:
      return NextResponse.json({ results: [] });
  }
}

// ============ TMDB (Películas y Series) ============
async function fetchTMDBRecommendations(
  type: string,
  genres: string,
  excludeTitles: string[],
  daySeed: number
) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ results: [] });
  }

  try {
    const endpoint = type === 'tv' ? 'discover/tv' : 'discover/movie';
    const discoverUrl = new URL(`https://api.themoviedb.org/3/${endpoint}`);
    discoverUrl.searchParams.set('api_key', apiKey);
    discoverUrl.searchParams.set('language', 'es-ES');

    const sortOptions = ['popularity.desc', 'vote_average.desc', 'vote_count.desc'];
    const sortIndex = Math.floor((daySeed - 1) / 91) % sortOptions.length;
    discoverUrl.searchParams.set('sort_by', sortOptions[sortIndex]);

    discoverUrl.searchParams.set('vote_average.gte', '7');
    discoverUrl.searchParams.set('vote_count.gte', '100');

    const page = ((daySeed - 1) % 10) + 1;
    discoverUrl.searchParams.set('page', page.toString());

    if (genres) {
      discoverUrl.searchParams.set('with_genres', genres);
    }

    const response = await fetch(discoverUrl.toString());
    if (!response.ok) return NextResponse.json({ results: [] });

    const data = await response.json();
    
    const filteredResults = (data.results || [])
      .filter((item: TMDBMovie | TMDBSeries) => {
        const title = 'title' in item ? item.title : item.name;
        const lowerTitle = (title || '').toLowerCase();
        return !excludeTitles.some(excluded =>
          lowerTitle.includes(excluded) || excluded.includes(lowerTitle)
        );
      })
      .filter((item: TMDBMovie | TMDBSeries) => item.poster_path !== null)
      .slice(0, 12);

    return NextResponse.json({
      results: filteredResults,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching TMDB recommendations:', error);
    return NextResponse.json({ results: [] });
  }
}

// ============ IGDB/RAWG (Juegos) ============
async function fetchGameRecommendations(
  genres: string,
  excludeTitles: string[],
  daySeed: number
) {
  // Intentar IGDB primero
  const igdbResults = await fetchIGDBRecommendations(genres, excludeTitles, daySeed);
  if (igdbResults.length > 0) {
    return NextResponse.json({
      results: igdbResults,
      updatedAt: new Date().toISOString(),
    });
  }

  // Fallback a RAWG
  const rawgResults = await fetchRAWGRecommendations(genres, excludeTitles, daySeed);
  return NextResponse.json({
    results: rawgResults,
    updatedAt: new Date().toISOString(),
  });
}

async function fetchIGDBRecommendations(
  genres: string,
  excludeTitles: string[],
  daySeed: number
): Promise<IGDBGame[]> {
  const clientId = process.env.IGDB_CLIENT_ID;
  const accessToken = await getIGDBToken();

  if (!clientId || !accessToken) return [];

  // Mapeo de géneros
  const genreMap: Record<string, number> = {
    'Acción': 4, 'Aventura': 31, 'RPG': 12, 'Shooter': 5,
    'Estrategia': 15, 'Puzzle': 9, 'Deportes': 14, 'Simulación': 13,
    'Carreras': 10, 'Terror': 32, 'Plataformas': 8, 'Lucha': 6,
  };

  const genreIds = genres.split(',')
    .map(g => genreMap[g.trim()])
    .filter(Boolean);

  let genreCondition = '';
  if (genreIds.length > 0) {
    genreCondition = `& genres = (${genreIds.join(',')})`;
  }

  // Variar los resultados según el día
  const offset = ((daySeed - 1) % 5) * 12;

  const query = `
    fields id,name,cover.url,total_rating,genres.name,platforms.name,summary;
    where total_rating >= 75 
      & total_rating_count >= 50 
      & cover != null
      ${genreCondition};
    sort total_rating desc;
    offset ${offset};
    limit 20;
  `;

  try {
    const response = await fetch('https://api.igdb.com/v4/games', {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'text/plain',
      },
      body: query.trim(),
    });

    if (!response.ok) return [];

    const data = await response.json();
    
    return (data || [])
      .filter((game: IGDBGame) => {
        const title = (game.name || '').toLowerCase();
        return !excludeTitles.some(excluded =>
          title.includes(excluded) || excluded.includes(title)
        );
      })
      .slice(0, 12);
  } catch {
    return [];
  }
}

async function fetchRAWGRecommendations(
  genres: string,
  excludeTitles: string[],
  daySeed: number
): Promise<RAWGGame[]> {
  const apiKey = process.env.RAWG_API_KEY;

  // Mapeo de géneros para RAWG (slugs)
  const genreMap: Record<string, string> = {
    'Acción': 'action', 'Aventura': 'adventure', 'RPG': 'role-playing-games-rpg',
    'Shooter': 'shooter', 'Estrategia': 'strategy', 'Puzzle': 'puzzle',
    'Deportes': 'sports', 'Simulación': 'simulation', 'Carreras': 'racing',
    'Terror': 'horror', 'Plataformas': 'platformer', 'Lucha': 'fighting',
  };

  const genreSlugs = genres.split(',')
    .map(g => genreMap[g.trim()])
    .filter(Boolean)
    .join(',');

  const page = ((daySeed - 1) % 5) + 1;

  try {
    let url = `https://api.rawg.io/api/games?ordering=-rating&page_size=20&page=${page}`;
    if (apiKey) url += `&key=${apiKey}`;
    if (genreSlugs) url += `&genres=${genreSlugs}`;

    const response = await fetch(url);
    if (!response.ok) return [];

    const data = await response.json();
    
    return (data.results || [])
      .filter((game: RAWGGame) => game.background_image !== null)
      .filter((game: RAWGGame) => {
        const title = (game.name || '').toLowerCase();
        return !excludeTitles.some(excluded =>
          title.includes(excluded) || excluded.includes(title)
        );
      })
      .slice(0, 12);
  } catch {
    return [];
  }
}

// ============ Google Books (Libros) ============
async function fetchBookRecommendations(
  genres: string,
  excludeTitles: string[],
  daySeed: number
) {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

  // Los géneros vienen directamente de la biblioteca del usuario
  // Pueden estar en inglés (de Google Books) o español
  // Convertimos a queries de Google Books
  const genreList = genres.split(',').map(g => g.trim()).filter(Boolean);

  // Crear queries para Google Books
  // Google Books usa "subject:" para buscar por género/categoría
  const queries = genreList.length > 0 
    ? genreList.slice(0, 3).map(g => {
        // Limpiar el género para usarlo como query
        const cleanGenre = g.toLowerCase()
          .replace(/\s+/g, '+')  // espacios a +
          .replace(/[^a-z0-9+]/g, ''); // quitar caracteres especiales
        return `subject:${cleanGenre}`;
      })
    : ['subject:fiction', 'subject:thriller', 'subject:fantasy'];

  const startIndex = ((daySeed - 1) % 5) * 10;

  try {
    const allResults: any[] = [];

    for (const query of queries.slice(0, 2)) { // Max 2 queries para no saturar
      const googleUrl = new URL('https://www.googleapis.com/books/v1/volumes');
      googleUrl.searchParams.set('q', query);
      googleUrl.searchParams.set('orderBy', 'relevance');
      googleUrl.searchParams.set('printType', 'books');
      googleUrl.searchParams.set('maxResults', '15');
      googleUrl.searchParams.set('startIndex', startIndex.toString());
      
      if (apiKey) {
        googleUrl.searchParams.set('key', apiKey);
      }

      const response = await fetch(googleUrl.toString());
      if (response.ok) {
        const data = await response.json();
        allResults.push(...(data.items || []));
      }
    }

    // Filtrar y formatear
    const filteredResults = allResults
      .filter((book: GoogleBookVolume) => {
        const title = (book.volumeInfo?.title || '').toLowerCase();
        return !excludeTitles.some(excluded =>
          title.includes(excluded) || excluded.includes(title)
        );
      })
      .filter((book: GoogleBookVolume) =>
        book.volumeInfo?.imageLinks?.thumbnail ||
        book.volumeInfo?.imageLinks?.smallThumbnail
      )
      .filter((book: GoogleBookVolume, index: number, self: GoogleBookVolume[]) =>
        index === self.findIndex(b => b.id === book.id)
      )
      .slice(0, 12);

    return NextResponse.json({
      results: filteredResults,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching book recommendations:', error);
    return NextResponse.json({ results: [] });
  }
}
