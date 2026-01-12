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
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const publicRoutes = ['/login', '/signup', '/auth/callback', '/landing', '/forgot-password', '/reset-password'];
        const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

        if (!user && !isPublicRoute) {
          // No hay usuario y no está en ruta pública -> redirigir a landing
          router.replace('/landing');
        } else if (user && (pathname === '/login' || pathname === '/signup' || pathname === '/landing')) {
          // Hay usuario y está en login/signup/landing -> redirigir al dashboard
          router.replace('/');
        } else {
          setIsAuthenticated(!!user);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsLoading(false);
      }
    };

    checkAuth();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      
      const publicRoutes = ['/login', '/signup', '/auth/callback', '/landing', '/forgot-password', '/reset-password'];
      const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

      if (!session && !isPublicRoute) {
        router.replace('/landing');
      } else if (session && (pathname === '/login' || pathname === '/signup' || pathname === '/landing')) {
        router.replace('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router, supabase.auth]);

  // Mostrar loading mientras verifica auth
  const publicRoutes = ['/login', '/signup', '/auth/callback', '/landing', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

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
