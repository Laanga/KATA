'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    // Timeout de seguridad para evitar loading infinito
    timeoutId = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    }, 5000);

    const checkAuth = async () => {
      try {
        const publicRoutes = ['/login', '/signup', '/auth/callback', '/landing', '/forgot-password', '/reset-password', '/verify-email', '/choose-username'];
        const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (!isMounted) return;
        
        // En rutas públicas, es normal que no haya sesión, no mostrar error
        if (error) {
          // Solo mostrar error si no es una ruta pública y no es un error de sesión faltante
          // (es esperado que no haya sesión en rutas públicas)
          const isSessionError = error.message?.includes('session') || error.message?.includes('Auth session missing');
          if (!isPublicRoute && !isSessionError) {
            console.error('Error checking auth:', error);
          }
          clearTimeout(timeoutId);
          setIsLoading(false);
          return;
        }

        if (!user && !isPublicRoute) {
          // No hay usuario y no está en ruta pública -> redirigir a landing
          if (timeoutId) clearTimeout(timeoutId);
          setIsLoading(false);
          router.replace('/landing');
          return;
        } else if (user) {
          // Verificar si el email está confirmado
          const emailConfirmed = user.email_confirmed_at !== null;
          const hasUsername = user.user_metadata?.username;
          
          // Si el email no está confirmado y no está en verify-email, redirigir
          if (!emailConfirmed && pathname !== '/verify-email' && !isPublicRoute) {
            if (timeoutId) clearTimeout(timeoutId);
            setIsLoading(false);
            router.replace('/verify-email');
            return;
          }
          
          // Si el email está confirmado pero no tiene username y no está en choose-username, redirigir
          if (emailConfirmed && !hasUsername && pathname !== '/choose-username' && !isPublicRoute) {
            if (timeoutId) clearTimeout(timeoutId);
            setIsLoading(false);
            router.replace('/choose-username');
            return;
          }
          
          // Si tiene username y está en choose-username, redirigir al dashboard
          if (hasUsername && pathname === '/choose-username') {
            if (timeoutId) clearTimeout(timeoutId);
            setIsLoading(false);
            router.replace('/');
            return;
          }
          
          // Si el email está confirmado y está en verify-email, redirigir al dashboard o choose-username
          if (emailConfirmed && pathname === '/verify-email') {
            if (timeoutId) clearTimeout(timeoutId);
            setIsLoading(false);
            router.replace(hasUsername ? '/' : '/choose-username');
            return;
          }
          
          // Si está en login/signup/landing y está autenticado, redirigir al dashboard
          if (pathname === '/login' || pathname === '/signup' || pathname === '/landing') {
            if (timeoutId) clearTimeout(timeoutId);
            setIsLoading(false);
            router.replace('/');
            return;
          }
        }
        
        if (timeoutId) clearTimeout(timeoutId);
        setIsAuthenticated(!!user);
        setIsLoading(false);
      } catch (error: any) {
        // En rutas públicas, es normal que no haya sesión, no mostrar error
        const publicRoutes = ['/login', '/signup', '/auth/callback', '/landing', '/forgot-password', '/reset-password', '/verify-email', '/choose-username'];
        const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
        const isSessionError = error?.message?.includes('session') || error?.message?.includes('Auth session missing');
        
        // Solo mostrar error si no es una ruta pública y no es un error de sesión faltante
        if (!isPublicRoute && !isSessionError) {
          console.error('Error checking auth:', error);
        }
        
        if (timeoutId) clearTimeout(timeoutId);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isMounted) return;
      
      setIsAuthenticated(!!session);
      
      const publicRoutes = ['/login', '/signup', '/auth/callback', '/landing', '/forgot-password', '/reset-password', '/verify-email', '/choose-username'];
      const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

      if (!session && !isPublicRoute) {
        router.replace('/landing');
      } else if (session) {
        // Verificar si el email está confirmado
        const { data: { user } } = await supabase.auth.getUser();
        const emailConfirmed = user?.email_confirmed_at !== null;
        const hasUsername = user?.user_metadata?.username;
        
        if (!emailConfirmed && pathname !== '/verify-email' && !isPublicRoute) {
          router.replace('/verify-email');
        } else if (emailConfirmed && !hasUsername && pathname !== '/choose-username' && !isPublicRoute) {
          router.replace('/choose-username');
        } else if (hasUsername && pathname === '/choose-username') {
          router.replace('/');
        } else if (emailConfirmed && pathname === '/verify-email') {
          router.replace(hasUsername ? '/' : '/choose-username');
        } else if (pathname === '/login' || pathname === '/signup' || pathname === '/landing') {
          router.replace('/');
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [pathname, router, supabase.auth]);

  // Mostrar loading mientras verifica auth (solo en rutas protegidas)
  const publicRoutes = ['/login', '/signup', '/auth/callback', '/landing', '/forgot-password', '/reset-password', '/verify-email', '/choose-username'];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // No bloquear rutas públicas durante el loading inicial
  // Esto permite que login/signup funcionen incluso si hay problemas con Supabase
  if (isLoading && !isPublicRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--accent-primary)] border-r-transparent"></div>
          <p className="mt-4 text-sm text-[var(--text-secondary)]">Cargando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
