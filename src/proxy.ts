import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

function validateEnvVars(): {
  supabaseUrl: string;
  supabasePublicKey: string;
  isValid: boolean;
} {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublicKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabasePublicKey) {
    if (process.env.NODE_ENV === 'production') {
      console.error(
        '[CRITICAL] Missing required environment variables:',
        !supabaseUrl ? '- NEXT_PUBLIC_SUPABASE_URL' : null,
        !supabasePublicKey
          ? '- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY fallback)'
          : null,
      );
      throw new Error(
        'Server misconfigured: Missing Supabase environment variables. ' +
          'Please check deployment configuration.',
      );
    } else {
      console.warn(
        '[WARN] Missing Supabase environment variables. ' +
          'Auth middleware will not work properly. ' +
          'Check your .env.local file.',
      );
    }
  }

  return {
    supabaseUrl: supabaseUrl || '',
    supabasePublicKey: supabasePublicKey || '',
    isValid: !!(supabaseUrl && supabasePublicKey),
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

export async function proxy(request: NextRequest) {
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

  const supabase = createServerClient(envConfig.supabaseUrl, envConfig.supabasePublicKey, {
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
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirect = (path: string) => {
    const target = NextResponse.redirect(new URL(path, request.url));
    response.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
    return target;
  };

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (!user && !isPublicRoute) {
    return redirect('/');
  }

  if (user && isAuthRoute) {
    return redirect('/home');
  }

  if (user && !isPublicRoute && !user.email_confirmed_at) {
    return redirect('/verify-email');
  }
  if (user && !isPublicRoute && !user.user_metadata?.username) {
    return redirect('/choose-username');
  }
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-.*\\.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$|api/).*)',
  ],
};
