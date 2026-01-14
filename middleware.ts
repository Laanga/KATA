import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login', '/signup', '/auth/callback', '/landing', '/forgot-password', '/reset-password', '/verify-email', '/choose-username'];
  const isPublicRoute = publicRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Solo verificar usuario en rutas protegidas
  let user = null;
  if (!isPublicRoute) {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      user = authUser;
    } catch {
      user = null;
    }
  }

  // Si no hay usuario y no está en una ruta pública, redirigir a landing
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/landing';
    return NextResponse.redirect(url);
  }

  // Si hay usuario y está en auth pages (login, signup, landing), redirigir al dashboard
  const authPages = ['/login', '/signup', '/landing'];
  if (user && authPages.includes(request.nextUrl.pathname)) {
    // Pero primero verificar si el usuario está completamente configurado
    const emailConfirmed = user.email_confirmed_at !== null;
    const hasUsername = user.user_metadata?.username;

    const url = request.nextUrl.clone();

    if (!emailConfirmed) {
      url.pathname = '/verify-email';
    } else if (!hasUsername) {
      url.pathname = '/choose-username';
    } else {
      url.pathname = '/';
    }

    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
