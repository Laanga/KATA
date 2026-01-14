'use client';

import { Navbar } from "@/components/layout/Navbar";
import { TypeComparison } from "@/components/dashboard/TypeComparison";
import { RatingDistribution } from "@/components/dashboard/RatingDistribution";
import { TopRatedItems } from "@/components/dashboard/TopRatedItems";
import { YearDistribution } from "@/components/dashboard/YearDistribution";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useMediaStore } from "@/lib/store";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const [userName, setUserName] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const activityRef = useRef<HTMLDivElement>(null);
  const isInitialized = useMediaStore((state) => state.isInitialized);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = user.user_metadata?.username || user.email?.split('@')[0] || 'Usuario';
        setUserName(name);
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // Timeline principal
      const mainTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Header animation con efecto de revelación
      mainTl
        .fromTo(
          headerRef.current?.querySelector('.header-title'),
          {
            y: 60,
            opacity: 0,
            scale: 0.95,
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: 'power4.out',
          }
        )
        .fromTo(
          headerRef.current?.querySelector('.header-subtitle'),
          {
            y: 30,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
          },
          '-=0.6'
        )
        .fromTo(
          headerRef.current?.querySelector('.header-kanji'),
          {
            opacity: 0,
            scale: 0.8,
            rotate: -10,
          },
          {
            opacity: 1,
            scale: 1,
            rotate: 0,
            duration: 0.8,
            ease: 'back.out(1.7)',
          },
          '-=0.5'
        )
        .fromTo(
          headerRef.current?.querySelector('.header-line'),
          {
            scaleX: 0,
            opacity: 0,
          },
          {
            scaleX: 1,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.out',
          },
          '-=0.4'
        );

      // Animación flotante del kanji
      if (headerRef.current?.querySelector('.header-kanji')) {
        gsap.to(headerRef.current.querySelector('.header-kanji'), {
          y: -8,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }

      // Stagger animation para las cards
      const cards = cardsRef.current?.children;
      if (cards) {
        gsap.fromTo(
          cards,
          {
            y: 50,
            opacity: 0,
            scale: 0.9,
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            stagger: {
              amount: 0.6,
              from: 'start',
            },
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // Activity Feed animation
      if (activityRef.current) {
        gsap.fromTo(
          activityRef.current,
          {
            y: 40,
            opacity: 0,
          },
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
          }
        );
      }

      // Parallax sutil en scroll
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
    }, containerRef);

    return () => ctx.revert();
  }, [mounted]);

  // Show skeleton while loading
  if (!isInitialized) {
    return (
      <>
        <Navbar />
        <DashboardSkeleton />
      </>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen pb-20 relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 max-w-7xl relative z-10">
        {/* Header con animaciones */}
        <header ref={headerRef} className="mb-8 sm:mb-12 md:mb-16">
          <div className="flex items-baseline gap-2 sm:gap-4 mb-3 sm:mb-4">
            <h1 className="header-title text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight text-balance bg-gradient-to-r from-white via-white to-emerald-400/90 bg-clip-text text-transparent leading-none">
              Resumen
            </h1>
            <div className="header-kanji text-2xl sm:text-4xl md:text-5xl text-emerald-400/60 font-serif opacity-0">
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

        {/* Primera Fila: Top Rated + 3 Donut Charts con stagger */}
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

        {/* Segunda Fila: Activity Feed */}
        <div ref={activityRef} className="mt-6 sm:mt-8 md:mt-12 will-change-transform">
          <ActivityFeed />
        </div>
      </main>
    </div>
  );
}
