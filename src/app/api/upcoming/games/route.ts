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
  const currentDate = now.toISOString().split('T')[0];

  const apiKey = process.env.IGDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'IGDB API Key missing' },
      { status: 500 }
    );
  }

  const igdbUrl = 'https://api.igdb.com/v4/games';

  const todayTimestamp = Math.floor(now.getTime() / 1000);
  const dateToTimestamp = Math.floor(dateTo.getTime() / 1000);

  const body = JSON.stringify({
    fields: 'id,name,cover.url,first_release_date,rating,rating_count,genres.name',
    where: `first_release_date >= ${todayTimestamp} & first_release_date <= ${dateToTimestamp}`,
    sort: 'rating desc',
    limit: 20,
  });

  const response = await fetch(igdbUrl, {
    method: 'POST',
    headers: {
      'Client-ID': process.env.IGDB_CLIENT_ID || '',
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body,
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: 'IGDB API request failed' },
      { status: 500 }
    );
  }

  const data = await response.json();

  const availableGenres = [
    { id: 'Action', name: 'Acción' },
    { id: 'Adventure', name: 'Aventura' },
    { id: 'Role-playing', name: 'Rol' },
    { id: 'Shooter', name: 'Disparos' },
    { id: 'Strategy', name: 'Estrategia' },
    { id: 'Puzzle', name: 'Puzzle' },
    { id: 'Sports', name: 'Deportes' },
    { id: 'Simulation', name: 'Simulación' },
    { id: 'Racing', name: 'Carreras' },
    { id: 'Horror', name: 'Terror' },
    { id: 'Music', name: 'Música' },
    { id: 'Platform', name: 'Plataformas' },
  ];

  return NextResponse.json({
    results: data || [],
    availableGenres,
  });
}
