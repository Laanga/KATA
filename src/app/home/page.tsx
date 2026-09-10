'use client';

import { TypeComparison } from '@/components/dashboard/TypeComparison';
import { RatingDistribution } from '@/components/dashboard/RatingDistribution';
import { TopRatedItems } from '@/components/dashboard/TopRatedItems';
import { YearDistribution } from '@/components/dashboard/YearDistribution';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useEffect, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { KataCard } from '@/components/media/KataCard';
import { useMediaStore } from '@/lib/store';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Library } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HomePage() {
  const { user } = useAuth();
  const userName = user?.user_metadata?.username || 'Usuario';
  const router = useRouter();
  const items = useMediaStore((state) => state.items);
  const stats = { total: items.length };
  const continuing = items
    .filter((item) => ['READING', 'PLAYING', 'WATCHING'].includes(item.status))
    .sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt))
    .slice(0, 4);

  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const activityRef = useRef<HTMLDivElement>(null);
  const isInitialized = useMediaStore((state) => state.isInitialized);

  useEffect(() => {
    if (!containerRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      return;

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
          '-=0.6',
        );
      }

      if (headerSubtitle) {
        mainTl.fromTo(
          headerSubtitle,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
          '-=0.6',
        );
      }

      if (headerKanji) {
        mainTl.fromTo(
          headerKanji,
          { opacity: 0, scale: 0.8, rotate: -10 },
          { opacity: 1, scale: 1, rotate: 0, duration: 0.8, ease: 'back.out(1.7)' },
          '-=0.5',
        );
      }

      if (headerLine) {
        mainTl.fromTo(
          headerLine,
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 0.8, ease: 'power2.out' },
          '-=0.4',
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
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          },
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
            scrollTrigger: {
              trigger: activityRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          },
        );
      }

      if (headerRef.current) {
        gsap.to(headerRef.current, {
          y: -30,
          opacity: 0.3,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [isInitialized]);

  if (!isInitialized) return <DashboardSkeleton />;

  return (
    <>
      <div ref={containerRef} className="min-h-screen pb-nav-safe relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '1s' }}
          />
        </div>

        <main className="container mx-auto px-4 sm:px-6 pt-10 md:pt-24 max-w-7xl relative z-10">
          <header ref={headerRef} className="mb-8 sm:mb-12 md:mb-16">
            <div className="flex items-baseline gap-2 sm:gap-4 mb-3 sm:mb-4">
              <h1 className="header-title kata-title-page">Resumen</h1>
              <div className="header-kanji text-2xl sm:text-4xl md:text-5xl text-emerald-400/60 font-serif">
                型
              </div>
            </div>
            <p className="header-subtitle text-base sm:text-lg md:text-xl text-[var(--text-secondary)] mb-4 sm:mb-6 md:mb-8 font-light">
              {stats.total === 0 ? 'Tu biblioteca empieza aquí, ' : 'Bienvenido de vuelta, '}
              {userName && <span className="text-emerald-400/80 font-medium">{userName}</span>}
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
                  label: 'Buscar Contenido',
                  onClick: () => router.push('/search'),
                }}
              />
            </div>
          ) : (
            <>
              {continuing.length > 0 && (
                <section aria-labelledby="continue-heading" className="mb-10">
                  <h2 id="continue-heading" className="text-2xl font-semibold mb-4">
                    Continúa donde lo dejaste
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {continuing.map((item) => (
                      <KataCard key={item.id} item={item} />
                    ))}
                  </div>
                </section>
              )}
              <div
                ref={cardsRef}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
              >
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
    </>
  );
}
