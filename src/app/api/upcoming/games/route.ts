import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientIdentifier } from '@/lib/utils/rateLimit';

// Cache para el token de IGDB (dura ~60 días)
let igdbTokenCache: { token: string; expiresAt: number } | null = null;

async function getIGDBToken(): Promise<string | null> {
  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  // Verificar si tenemos un token válido en cache
  if (igdbTokenCache && Date.now() < igdbTokenCache.expiresAt) {
    return igdbTokenCache.token;
  }

  try {
    const response = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
      { method: 'POST' }
    );

    if (!response.ok) {
      console.error('Failed to get IGDB token:', await response.text());
      return null;
    }

    const data = await response.json();
    
    // Guardar en cache (expires_in viene en segundos, restamos 1 hora por seguridad)
    igdbTokenCache = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in - 3600) * 1000,
    };

    return data.access_token;
  } catch (error) {
    console.error('Error getting IGDB token:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const identifier = getClientIdentifier(request);
  const limitResult = rateLimit(identifier, { windowMs: 60000, maxRequests: 20 });

  if (!limitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
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

  // Intentar IGDB primero
  const igdbResult = await fetchFromIGDB(now, dateTo, genre);
  if (igdbResult && igdbResult.length > 0) {
    return NextResponse.json({
      results: igdbResult,
      availableGenres: getGameGenres(),
    });
  }

  // Fallback a RAWG
  console.log('IGDB failed or empty, trying RAWG...');
  return await fetchFromRAWG(now, dateTo, genre);
}

async function fetchFromIGDB(dateFrom: Date, dateTo: Date, genre?: string | null): Promise<any[] | null> {
  const clientId = process.env.IGDB_CLIENT_ID;
  const accessToken = await getIGDBToken();

  if (!clientId || !accessToken) {
    console.log('IGDB credentials missing');
    return null;
  }

  const todayTimestamp = Math.floor(dateFrom.getTime() / 1000);
  const dateToTimestamp = Math.floor(dateTo.getTime() / 1000);

  // Mapeo de géneros para IGDB
  const igdbGenreMap: Record<string, number> = {
    'action': 4,
    'adventure': 31,
    'rpg': 12,
    'shooter': 5,
    'strategy': 15,
    'puzzle': 9,
    'sports': 14,
    'simulation': 13,
    'racing': 10,
    'horror': 32,
    'platformer': 8,
    'fighting': 6,
    'indie': 32,
  };

  let genreCondition = '';
  if (genre && genre !== 'ALL' && igdbGenreMap[genre]) {
    genreCondition = ` & genres = (${igdbGenreMap[genre]})`;
  }

  // Query para juegos próximos con hype o follows
  const query = `
    fields id,name,cover.url,first_release_date,total_rating,genres.name,platforms.name,hypes,follows;
    where first_release_date >= ${todayTimestamp} 
      & first_release_date <= ${dateToTimestamp} 
      & cover != null
      & (hypes > 0 | follows > 0 | total_rating > 0)
      ${genreCondition};
    sort first_release_date asc;
    limit 40;
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('IGDB API Error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching from IGDB:', error);
    return null;
  }
}

async function fetchFromRAWG(dateFrom: Date, dateTo: Date, genre?: string | null) {
  const apiKey = process.env.RAWG_API_KEY;
  
  const dateFromStr = dateFrom.toISOString().split('T')[0];
  const dateToStr = dateTo.toISOString().split('T')[0];

  try {
    // RAWG permite uso sin API key pero con límites más bajos
    let url = `https://api.rawg.io/api/games?dates=${dateFromStr},${dateToStr}&ordering=-added&page_size=40`;
    
    if (apiKey) {
      url += `&key=${apiKey}`;
    }
    
    if (genre && genre !== 'ALL') {
      url += `&genres=${genre}`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('RAWG API Error:', response.status, await response.text());
      return NextResponse.json({
        results: [],
        availableGenres: getGameGenres(),
      });
    }

    const data = await response.json();

    const results = (data.results || [])
      .filter((game: any) => game.background_image) // Solo juegos con imagen
      .map((game: any) => ({
        id: game.id,
        name: game.name,
        cover: { url: game.background_image },
        first_release_date: game.released ? Math.floor(new Date(game.released).getTime() / 1000) : null,
        rating: game.rating ? game.rating * 2 : null,
        genres: game.genres?.map((g: any) => ({ name: g.name })) || [],
        platforms: game.platforms?.map((p: any) => ({ name: p.platform.name })) || [],
      }));

    return NextResponse.json({
      results,
      availableGenres: getGameGenres(),
    });
  } catch (error) {
    console.error('Error fetching from RAWG:', error);
    return NextResponse.json({
      results: [],
      availableGenres: getGameGenres(),
    });
  }
}

function getGameGenres() {
  return [
    { id: 'action', name: 'Acción' },
    { id: 'adventure', name: 'Aventura' },
    { id: 'rpg', name: 'RPG' },
    { id: 'shooter', name: 'Shooter' },
    { id: 'strategy', name: 'Estrategia' },
    { id: 'puzzle', name: 'Puzzle' },
    { id: 'sports', name: 'Deportes' },
    { id: 'simulation', name: 'Simulación' },
    { id: 'racing', name: 'Carreras' },
    { id: 'platformer', name: 'Plataformas' },
    { id: 'fighting', name: 'Lucha' },
    { id: 'indie', name: 'Indie' },
  ];
}
