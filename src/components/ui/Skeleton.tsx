'use client';

import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-white/5',
        className
      )}
    />
  );
}

// Card skeleton for media items
export function MediaCardSkeleton() {
  return (
    <div className="aspect-[2/3] w-full overflow-hidden rounded-lg bg-[var(--bg-secondary)]">
      <Skeleton className="h-full w-full" />
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
    <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <MediaCardSkeleton key={i} />
      ))}
    </div>
  );
}
