import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  console.log('='.repeat(60));
  console.log('Middleware: Processing request', { pathname, method: request.method });

  // Debug: Log all cookies
  const allCookies = request.cookies.getAll();
  console.log('Middleware: All cookies received:', {
    count: allCookies.length,
    cookies: allCookies.map(c => ({
      name: c.name,
      value: c.value ? c.value.substring(0, 30) + '...' : '(empty)'
    })),
  });

  // Debug: Check specifically for Supabase cookies
  const supabaseCookieNames = allCookies.filter(c =>
    c.name.includes('sb-access-token') || c.name.includes('sb-refresh-token')
  );
  console.log('Middleware: Supabase cookies found:', {
    count: supabaseCookieNames.length,
    cookies: supabaseCookieNames.map(c => ({ name: c.name, hasValue: !!c.value })),
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  console.log('Middleware: User detection', {
    pathname,
    hasUser: !!user,
    userId: user?.id,
    email: user?.email,
  });

  const publicRoutes = [
    '/login',
    '/signup',
    '/auth/callback',
    '/',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/choose-username',
  ];

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  console.log('Middleware: Route classification', {
    pathname,
    isPublicRoute,
    matchedPublicRoute: publicRoutes.find(r => pathname.startsWith(r)),
  });

  // CASE 1: No user on protected route
  if (!user && !isPublicRoute) {
    console.log('🔴 Middleware: No user on protected route, redirecting to / (landing)');
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
  }

  // CASE 2: User on auth or landing page
  if (user && (pathname === '/login' || pathname === '/signup' || pathname === '/')) {
    console.log('🟢 Middleware: User on auth/landing page, redirecting to /home');
    const url = new URL('/home', request.url);
    return NextResponse.redirect(url);
  }

  console.log('✅ Middleware: Allowing request to proceed');
  console.log('='.repeat(60));
  return NextResponse.next();
}

// Use a simpler, more explicit matcher pattern
export const config = {
  matcher: [
    // Match all routes except:
    // - _next (Next.js internals)
    // - Static files with extensions
    '/((?!_next|api/|favicon.ico).*)',
  ],
};
