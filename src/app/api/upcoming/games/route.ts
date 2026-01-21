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

  const clientId = process.env.IGDB_CLIENT_ID;
  const accessToken = process.env.IGDB_ACCESS_TOKEN;

  // Si no hay credenciales, usar datos de prueba o RAWG como alternativa
  if (!clientId || !accessToken) {
    console.log('IGDB credentials missing, trying RAWG API...');
    return await fetchFromRAWG(period);
  }

  const todayTimestamp = Math.floor(now.getTime() / 1000);
  const dateToTimestamp = Math.floor(dateTo.getTime() / 1000);

  // IGDB usa formato Apicalypse (texto plano)
  const query = `
    fields id,name,cover.url,first_release_date,rating,genres.name,platforms.name;
    where first_release_date >= ${todayTimestamp} & first_release_date <= ${dateToTimestamp} & cover != null;
    sort first_release_date asc;
    limit 30;
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
      // Fallback a RAWG
      return await fetchFromRAWG(period);
    }

    const data = await response.json();

    return NextResponse.json({
      results: data || [],
      availableGenres: getGameGenres(),
    });
  } catch (error) {
    console.error('Error fetching from IGDB:', error);
    return await fetchFromRAWG(period);
  }
}

// Alternativa usando RAWG API (gratis, no requiere OAuth)
async function fetchFromRAWG(period: string) {
  const apiKey = process.env.RAWG_API_KEY;
  
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

  const dateFrom = now.toISOString().split('T')[0];
  const dateTo = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  try {
    let url = `https://api.rawg.io/api/games?dates=${dateFrom},${dateTo}&ordering=released&page_size=30`;
    
    if (apiKey) {
      url += `&key=${apiKey}`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('RAWG API Error:', await response.text());
      return NextResponse.json({
        results: [],
        availableGenres: getGameGenres(),
      });
    }

    const data = await response.json();

    // Transformar formato RAWG al formato esperado
    const results = (data.results || []).map((game: any) => ({
      id: game.id,
      name: game.name,
      cover: game.background_image ? { url: game.background_image } : null,
      first_release_date: game.released ? Math.floor(new Date(game.released).getTime() / 1000) : null,
      rating: game.rating ? game.rating * 2 : null, // RAWG usa escala 0-5, convertir a 0-10
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
    { id: 'horror', name: 'Terror' },
    { id: 'platformer', name: 'Plataformas' },
    { id: 'fighting', name: 'Lucha' },
  ];
}
