import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

function validateEnvVars(): {
  supabaseUrl: string;
  supabaseAnonKey: string;
  isValid: boolean;
} {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === 'production') {
      console.error(
        '[CRITICAL] Missing required environment variables:',
        !supabaseUrl ? '- NEXT_PUBLIC_SUPABASE_URL' : null,
        !supabaseAnonKey ? '- NEXT_PUBLIC_SUPABASE_ANON_KEY' : null,
      );
      throw new Error(
        'Server misconfigured: Missing Supabase environment variables. ' +
        'Please check deployment configuration.'
      );
    } else {
      console.warn(
        '[WARN] Missing Supabase environment variables. ' +
        'Auth middleware will not work properly. ' +
        'Check your .env.local file.'
      );
    }
  }

  return {
    supabaseUrl: supabaseUrl || '',
    supabaseAnonKey: supabaseAnonKey || '',
    isValid: !!(supabaseUrl && supabaseAnonKey),
  };
}

const envConfig = validateEnvVars();

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/auth/callback',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/choose-username',
];

const AUTH_ROUTES = ['/login', '/signup', '/'];

export async function middleware(request: NextRequest) {
  if (!envConfig.isValid) {
    console.warn('[Auth] Skipping auth due to missing env vars');
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    envConfig.supabaseUrl,
    envConfig.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isPublicRoute = PUBLIC_ROUTES.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (!user && !isPublicRoute) {
    const redirectUrl = new URL('/', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthRoute) {
    const redirectUrl = new URL('/home', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$|api/).*)',
  ],
};
