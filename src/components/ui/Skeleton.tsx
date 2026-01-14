'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'default' | 'text' | 'circular' | 'rectangular' | 'kanji';
}

export function Skeleton({ className, variant = 'default' }: SkeletonProps) {
  const kanjiRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (variant === 'kanji' && kanjiRef.current && containerRef.current) {
      const path = kanjiRef.current;
      const length = path.getTotalLength();

      // Configurar el path para animación
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
        opacity: 0.3,
      });

      // Animación de escritura continua
      const tl = gsap.timeline({ repeat: -1 });
      
      tl.to(path, {
        strokeDashoffset: 0,
        opacity: 0.6,
        duration: 1.5,
        ease: 'power2.inOut',
      })
      .to(path, {
        strokeDashoffset: -length,
        opacity: 0.3,
        duration: 1.5,
        ease: 'power2.inOut',
        delay: 0.3,
      });

      // Pulso del contenedor
      gsap.to(containerRef.current, {
        scale: 1.05,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      return () => {
        tl.kill();
      };
    }
  }, [variant]);

  if (variant === 'kanji') {
    return (
      <div 
        ref={containerRef}
        className={cn('flex items-center justify-center', className)}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <path
            ref={kanjiRef}
            d="M 20 20 L 80 20 M 50 20 L 50 80 M 30 50 L 70 50 M 35 80 L 65 80"
            stroke="var(--accent-primary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.4"
          />
        </svg>
      </div>
    );
  }

  const baseClasses = 'animate-pulse bg-white/5';
  const variantClasses = {
    default: 'rounded-md',
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
    />
  );
}

// Card skeleton for media items
export function MediaCardSkeleton() {
  return (
    <div className="aspect-[2/3] w-full overflow-hidden rounded-lg bg-[var(--bg-secondary)] border border-white/5 relative">
      <Skeleton className="h-full w-full" variant="kanji" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
    </div>
  );
}

// Grid of skeletons
export function MediaGridSkeleton({ count = 6 }: { count?: number }) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;

    const skeletons = gridRef.current.children;

    gsap.set(skeletons, {
      opacity: 0,
      scale: 0.9,
    });

    gsap.to(skeletons, {
      opacity: 1,
      scale: 1,
      duration: 0.4,
      stagger: 0.05,
      ease: 'power2.out',
    });
  }, [count]);

  return (
    <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <MediaCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Dashboard Metrics Skeleton
export function DashboardMetricsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-[var(--bg-secondary)] border border-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <Skeleton variant="kanji" className="h-full w-full" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
              <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg" variant="rectangular" />
              <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" variant="text" />
            </div>
            <Skeleton className="h-6 sm:h-8 w-12 sm:w-16 mb-1" variant="text" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Chart Skeleton (for donut charts)
export function ChartSkeleton() {
  return (
    <div className="bg-[var(--bg-secondary)] border border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <Skeleton variant="kanji" className="h-full w-full" />
      </div>
      <div className="relative z-10">
        <Skeleton className="h-5 sm:h-6 w-24 sm:w-32 mb-4 sm:mb-6" variant="text" />
        <div className="h-48 sm:h-64 flex items-center justify-center">
          <div className="relative">
            <Skeleton className="h-32 w-32 sm:h-48 sm:w-48" variant="kanji" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-[var(--bg-primary)] border-2 border-white/10" />
            </div>
          </div>
        </div>
        <div className="mt-4 sm:mt-6 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" variant="circular" />
              <Skeleton className="h-3 sm:h-4 flex-1" variant="text" />
              <Skeleton className="h-3 sm:h-4 w-6 sm:w-8" variant="text" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Top Rated Items Skeleton
export function TopRatedSkeleton() {
  return (
    <div className="bg-[var(--bg-secondary)] border border-white/5 rounded-xl sm:rounded-2xl overflow-hidden relative">
      <div className="absolute inset-0 opacity-5">
        <Skeleton variant="kanji" className="h-full w-full" />
      </div>
      <div className="relative z-10">
        <div className="p-4 sm:p-6 border-b border-white/5">
          <Skeleton className="h-5 sm:h-6 w-24 sm:w-32 mb-2" variant="text" />
          <Skeleton className="h-3 sm:h-4 w-36 sm:w-48" variant="text" />
        </div>
        <div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-b border-white/5 last:border-0">
              <div className="relative h-12 w-9 sm:h-16 sm:w-12 rounded overflow-hidden flex-shrink-0">
                <Skeleton variant="kanji" className="h-full w-full" />
              </div>
              <div className="flex-1 min-w-0">
                <Skeleton className="h-4 sm:h-5 w-24 sm:w-32 mb-1.5 sm:mb-2" variant="text" />
                <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" variant="text" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Activity Feed Skeleton
export function ActivityFeedSkeleton() {
  return (
    <div className="bg-[var(--bg-secondary)] border border-white/5 rounded-xl sm:rounded-2xl overflow-hidden relative">
      <div className="absolute inset-0 opacity-5">
        <Skeleton variant="kanji" className="h-full w-full" />
      </div>
      <div className="relative z-10">
        <div className="p-4 sm:p-6 border-b border-white/5">
          <Skeleton className="h-5 sm:h-6 w-28 sm:w-32" variant="text" />
        </div>
        <div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-b border-white/5 last:border-0">
              <div className="relative h-10 w-7 sm:h-12 sm:w-8 rounded overflow-hidden flex-shrink-0">
                <Skeleton variant="kanji" className="h-full w-full" />
              </div>
              <div className="flex-1 min-w-0">
                <Skeleton className="h-3 sm:h-4 w-24 sm:w-28 mb-1.5 sm:mb-2" variant="text" />
                <Skeleton className="h-3 w-16 sm:w-20" variant="text" />
              </div>
              <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" variant="text" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Dashboard Full Skeleton
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 pt-24 max-w-7xl">
        {/* Header Skeleton */}
        <div className="mb-16">
          <Skeleton className="h-12 w-48 mb-4" variant="text" />
          <Skeleton className="h-6 w-64 mb-8" variant="text" />
          <Skeleton className="h-px w-64" variant="rectangular" />
        </div>

        {/* Metrics Skeleton */}
        <DashboardMetricsSkeleton />

        {/* Charts Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8">
          <TopRatedSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>

        {/* Activity Feed Skeleton */}
        <div className="mt-12">
          <ActivityFeedSkeleton />
        </div>
      </div>
    </div>
  );
}

// Library Page Skeleton
export function LibrarySkeleton() {
  return (
    <div className="min-h-screen pb-20">
      <div className="container mx-auto px-4 pt-24">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" variant="text" />
          <Skeleton className="h-5 w-32 mb-6" variant="text" />
          <DashboardMetricsSkeleton />
        </div>

        {/* Actions Skeleton */}
        <div className="flex justify-end gap-2 mb-6">
          <Skeleton className="h-10 w-24" variant="rectangular" />
          <Skeleton className="h-10 w-10 rounded-lg" variant="rectangular" />
          <Skeleton className="h-10 w-10 rounded-lg" variant="rectangular" />
        </div>

        {/* Filter Bar Skeleton */}
        <div className="flex flex-wrap gap-4 mb-8 pb-4 border-b border-white/10">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-32 rounded-md" variant="rectangular" />
          ))}
        </div>

        {/* Grid Skeleton */}
        <MediaGridSkeleton count={12} />
      </div>
    </div>
  );
}

// Profile Page Skeleton
export function ProfileSkeleton() {
  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <div className="container mx-auto px-4 pt-32 max-w-5xl">
        {/* Header Skeleton */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative h-28 w-28 rounded-full bg-white/5 flex items-center justify-center overflow-hidden">
                <Skeleton variant="circular" className="h-full w-full" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-10 w-64" variant="text" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" variant="circular" />
                  <Skeleton className="h-4 w-32" variant="text" />
                </div>
                <Skeleton className="h-4 w-48" variant="text" />
              </div>
            </div>
            <Skeleton className="h-10 w-32 rounded-full" variant="rectangular" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-[var(--bg-secondary)] border border-white/5 rounded-xl p-6">
              <div className="mb-4">
                <Skeleton className="h-5 w-5" variant="rectangular" />
              </div>
              <Skeleton className="h-8 w-16 mb-1" variant="text" />
              <Skeleton className="h-4 w-20" variant="text" />
              <div className="mt-4 h-1 w-full rounded-full bg-white/5">
                <Skeleton className="h-full w-2/3" variant="rectangular" />
              </div>
            </div>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="border-b border-white/10 mb-8">
          <div className="flex gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-24" variant="text" />
            ))}
          </div>
        </div>

        {/* Content Area Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {/* Activity Chart Skeleton */}
            <div className="bg-[var(--bg-secondary)] border border-white/5 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Skeleton className="h-6 w-6" variant="rectangular" />
                <Skeleton className="h-6 w-32" variant="text" />
              </div>
              <div className="h-32 flex items-end justify-between gap-1">
                {Array.from({ length: 40 }).map((_, i) => (
                  <Skeleton key={i} className="w-full h-full rounded-sm" variant="rectangular" />
                ))}
              </div>
            </div>

            {/* Top Rated Items Skeleton */}
            <div>
              <Skeleton className="h-8 w-48 mb-6" variant="text" />
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <MediaCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity Skeleton */}
          <div className="space-y-8">
            <Skeleton className="h-6 w-40 mb-4" variant="text" />
            <div className="relative border-l border-white/10 pl-6 space-y-8 py-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="relative">
                  <Skeleton className="absolute -left-[29px] top-1 h-3 w-3 rounded-full" variant="circular" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" variant="text" />
                    <Skeleton className="h-3 w-32" variant="text" />
                    <Skeleton className="h-3 w-24" variant="text" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
