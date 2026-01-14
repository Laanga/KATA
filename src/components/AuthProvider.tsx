'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname } from 'next/navigation';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const publicRoutes = [
    '/login',
    '/signup',
    '/auth/callback',
    '/landing',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/choose-username',
  ];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    // Safety timeout to prevent infinite loading
    timeoutId = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    }, 8000);

    // Check auth on mount
    const checkAuth = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (!isMounted) return;

        if (error) {
          // Silently ignore "Auth session missing" on public routes
          const isSessionMissing = error.message?.includes('Auth session missing');
          if (!isSessionMissing && !isPublicRoute) {
            clearTimeout(timeoutId!);
          }
          setIsLoading(false);
          return;
        }

        if (!user && !isPublicRoute) {
          // No user and not on public route -> redirect to landing
          if (timeoutId) clearTimeout(timeoutId);
          setIsLoading(false);
          router.replace('/landing');
          return;
        }

        if (user) {
          // Check if email is confirmed and user has username
          const emailConfirmed = user.email_confirmed_at !== null;
          const hasUsername = user.user_metadata?.username;

          if (!emailConfirmed && pathname !== '/verify-email' && !isPublicRoute) {
            if (timeoutId) clearTimeout(timeoutId);
            setIsLoading(false);
            router.replace('/verify-email');
            return;
          }

          if (emailConfirmed && !hasUsername && pathname !== '/choose-username' && !isPublicRoute) {
            if (timeoutId) clearTimeout(timeoutId);
            setIsLoading(false);
            router.replace('/choose-username');
            return;
          }

          if (hasUsername && pathname === '/choose-username') {
            if (timeoutId) clearTimeout(timeoutId);
            setIsLoading(false);
            router.replace('/');
            return;
          }

          if (emailConfirmed && pathname === '/verify-email') {
            if (timeoutId) clearTimeout(timeoutId);
            setIsLoading(false);
            router.replace(hasUsername ? '/' : '/choose-username');
            return;
          }

          if (pathname === '/login' || pathname === '/signup' || pathname === '/landing') {
            if (timeoutId) clearTimeout(timeoutId);
            setIsLoading(false);
            router.replace('/');
            return;
          }
        }

        clearTimeout(timeoutId!);
        setIsLoading(false);
      } catch {
        if (timeoutId) clearTimeout(timeoutId);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        const { user } = session || {};
        const emailConfirmed = user?.email_confirmed_at !== null;
        const hasUsername = user?.user_metadata?.username;

        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            // User just signed in
            if (!emailConfirmed) {
              router.replace('/verify-email');
              return;
            }
            if (!hasUsername) {
              router.replace('/choose-username');
              return;
            }
            // User is fully authenticated, go to home
            if (pathname === '/login' || pathname === '/signup' || pathname === '/landing') {
              router.replace('/');
            }
            break;

          case 'SIGNED_OUT':
            // User signed out
            if (!isPublicRoute) {
              router.replace('/landing');
            }
            break;

          case 'TOKEN_REFRESHED':
            // Session refreshed, no action needed
            break;

          case 'USER_UPDATED':
            // User metadata updated (e.g., username set)
            if (hasUsername && pathname === '/choose-username') {
              router.replace('/');
            }
            break;
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [pathname, router, supabase.auth]);

  // Show loading while checking auth (only on protected routes)
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
