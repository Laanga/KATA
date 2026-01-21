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

  const googleUrl = new URL('https://www.googleapis.com/books/v1/volumes');
  googleUrl.searchParams.set('q', 'new releases');
  googleUrl.searchParams.set('orderBy', 'newest');
  googleUrl.searchParams.set('printType', 'books');
  googleUrl.searchParams.set('startIndex', '0');
  googleUrl.searchParams.set('maxResults', '40');

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  if (apiKey) {
    googleUrl.searchParams.set('key', apiKey);
  }

  const response = await fetch(googleUrl.toString());

  if (!response.ok) {
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  }

  const data = await response.json();

  const availableCategories = [
    { id: 'Fiction', name: 'Ficción' },
    { id: 'Science', name: 'Ciencia' },
    { id: 'History', name: 'Historia' },
    { id: 'Biography', name: 'Biografía' },
    { id: 'Mystery', name: 'Misterio' },
    { id: 'Fantasy', name: 'Fantasía' },
    { id: 'Romance', name: 'Romance' },
    { id: 'Thriller', name: 'Thriller' },
    { id: 'Horror', name: 'Terror' },
    { id: 'Adventure', name: 'Aventura' },
    { id: 'NonFiction', name: 'No ficción' },
  ];

  return NextResponse.json({
    results: data.items || [],
    availableGenres: availableCategories,
  });
}
