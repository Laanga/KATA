import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Rutas que no requieren autenticación
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

// Rutas de autenticación (si el usuario ya está autenticado, redirigir a /home)
const AUTH_ROUTES = ['/login', '/signup', '/'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Crear response que podemos modificar
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Crear cliente de Supabase con capacidad de actualizar cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  // getUser() verifica el token y lo refresca si es necesario
  const { data: { user } } = await supabase.auth.getUser();

  // Determinar si la ruta es pública
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Determinar si es una ruta de auth (login/signup/landing)
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  // CASO 1: Usuario NO autenticado en ruta protegida
  if (!user && !isPublicRoute) {
    const redirectUrl = new URL('/', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // CASO 2: Usuario autenticado en ruta de auth (login/signup/landing)
  if (user && isAuthRoute) {
    const redirectUrl = new URL('/home', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files and api
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$|api/).*)',
  ],
};
