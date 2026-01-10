'use client';

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
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <MediaCardSkeleton key={i} />
      ))}
    </div>
  );
}
