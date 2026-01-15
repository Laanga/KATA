'use client';

import { Navbar } from "@/components/layout/Navbar";
import { TypeComparison } from "@/components/dashboard/TypeComparison";
import { RatingDistribution } from "@/components/dashboard/RatingDistribution";
import { TopRatedItems } from "@/components/dashboard/TopRatedItems";
import { YearDistribution } from "@/components/dashboard/YearDistribution";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useMediaStore } from "@/lib/store";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Library } from "lucide-react";
import { useRouter } from "next/navigation";

export const dynamic = 'force-dynamic';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HomePage() {
  const [userName, setUserName] = useState<string>('');
  const [initError, setInitError] = useState<string | null>(null);
  const router = useRouter();
  const getStats = useMediaStore((state) => state.getStats);
  const stats = getStats();

  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const activityRef = useRef<HTMLDivElement>(null);
  const isInitialized = useMediaStore((state) => state.isInitialized);
  const initialize = useMediaStore((state) => state.initialize);
  const isLoading = useMediaStore((state) => state.isLoading);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const mainTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      const headerTitle = headerRef.current?.querySelector('.header-title');
      const headerSubtitle = headerRef.current?.querySelector('.header-subtitle');
      const headerKanji = headerRef.current?.querySelector('.header-kanji');
      const headerLine = headerRef.current?.querySelector('.header-line');

      if (headerTitle) {
        mainTl.fromTo(
          headerTitle,
          { y: 60, opacity: 0, scale: 0.95 },
          { y: 0, opacity: 1, scale: 1, duration: 1, ease: 'power4.out' },
          '-=0.6'
        );
      }

      if (headerSubtitle) {
        mainTl.fromTo(
          headerSubtitle,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
          '-=0.6'
        );
      }

      if (headerKanji) {
        mainTl.fromTo(
          headerKanji,
          { opacity: 0, scale: 0.8, rotate: -10 },
          { opacity: 1, scale: 1, rotate: 0, duration: 0.8, ease: 'back.out(1.7)' },
          '-=0.5'
        );
      }

      if (headerLine) {
        mainTl.fromTo(
          headerLine,
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 0.8, ease: 'power2.out' },
          '-=0.4'
        );
      }

      if (headerKanji) {
        gsap.to(headerKanji, {
          y: -8,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }

      const cards = cardsRef.current?.children;
      if (cards) {
        gsap.fromTo(
          cards,
          { y: 50, opacity: 0, scale: 0.9 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            stagger: { amount: 0.6, from: 'start' },
            ease: 'power3.out',
            scrollTrigger: { trigger: cardsRef.current, start: 'top 85%', toggleActions: 'play none none none' }
          }
        );
      }

      if (activityRef.current) {
        gsap.fromTo(
          activityRef.current,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: { trigger: activityRef.current, start: 'top 85%', toggleActions: 'play none none none' }
          }
        );
      }

      if (headerRef.current) {
        gsap.to(headerRef.current, {
          y: -30,
          opacity: 0.3,
          scrollTrigger: { trigger: containerRef.current, start: 'top top', end: 'bottom top', scrub: 1 }
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [containerRef, headerRef, cardsRef, activityRef]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    if (!isInitialized && !isLoading) {
      timeoutId = setTimeout(() => {
        setInitError('La inicialización está tardando demasiado. Por favor recarga la página.');
      }, 10000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isInitialized, isLoading]);

  const handleRetry = async () => {
    try {
      await initialize();
    } catch {
      setInitError('Error al cargar los datos. Por favor intenta de nuevo.');
    }
  };

  const getUser = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const name = user.user_metadata?.username || user.email?.split('@')[0] || 'Usuario';
      requestAnimationFrame(() => setUserName(name));
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  if (!isInitialized) {
    return (
      <>
        <Navbar />
        {initError ? (
          <div className="min-h-screen flex items-center justify-center px-4">
            <div className="text-center max-w-md">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6 938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77-1.333.192-3 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Error al cargar</h2>
              <p className="text-[var(--text-secondary)] mb-6">{initError}</p>
              <button
                onClick={handleRetry}
                className="px-6 py-2 rounded-lg bg-[var(--accent-primary)] text-black font-medium hover:bg-[var(--accent-primary)]/90 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        ) : (
          <DashboardSkeleton />
        )}
      </>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen pb-24 md:pb-0 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <Navbar />
      <BottomNavigation />

      <main className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 max-w-7xl relative z-10">
        <header ref={headerRef} className="mb-8 sm:mb-12 md:mb-16">
          <div className="flex items-baseline gap-2 sm:gap-4 mb-3 sm:mb-4">
            <h1 className="header-title text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight text-balance bg-gradient-to-r from-white via-white to-emerald-400/90 bg-clip-text text-transparent leading-none">
              Resumen
            </h1>
            <div className="header-kanji text-2xl sm:text-4xl md:text-5xl text-emerald-400/60 font-serif">
              型
            </div>
          </div>
          <p className="header-subtitle text-base sm:text-lg md:text-xl text-[var(--text-secondary)] mb-4 sm:mb-6 md:mb-8 font-light">
            {userName ? `Bienvenido de vuelta, ` : 'Bienvenido de vuelta, '}
            {userName && (
              <span className="text-emerald-400/80 font-medium">{userName}</span>
            )}
          </p>
          <div className="header-line h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent max-w-md" />
        </header>

        {stats.total === 0 ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <EmptyState
              icon={<Library className="w-16 h-16" />}
              title="Tu biblioteca está vacía"
              description="Empieza a trackear tus películas, series, libros y videojuegos favoritos."
              action={{
                label: "Buscar Contenido",
                onClick: () => router.push('/library'),
              }}
            />
          </div>
        ) : (
          <>
            <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="will-change-transform">
                <TopRatedItems />
              </div>
              <div className="will-change-transform">
                <TypeComparison />
              </div>
              <div className="will-change-transform">
                <RatingDistribution />
              </div>
              <div className="will-change-transform">
                <YearDistribution />
              </div>
            </div>

            <div ref={activityRef} className="mt-6 sm:mt-8 md:mt-12 will-change-transform">
              <ActivityFeed />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
