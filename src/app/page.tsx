'use client';

import { useState } from 'react';
import { Navbar } from "@/components/layout/Navbar";
import { KataCard } from "@/components/media/KataCard";
import { useMediaStore } from "@/lib/store";
import { MediaGridSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { AnimatedGrid } from "@/components/AnimatedGrid";
import { FadeIn } from "@/components/FadeIn";
import { FloatingAddButton } from "@/components/FloatingAddButton";
import { AddItemModal } from "@/components/media/AddItemModal";
import { ShortcutsModal } from "@/components/ShortcutsModal";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

export default function Home() {
  const router = useRouter();
  const items = useMediaStore((state) => state.items);
  const getStats = useMediaStore((state) => state.getStats);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  
  const stats = getStats();
  
  const inProgressStatuses = ['READING', 'PLAYING', 'WATCHING'];
  const inProgressItems = items.filter((item) => 
    inProgressStatuses.includes(item.status)
  );
  
  const recentItems = items.slice(0, 6);

  useKeyboardShortcuts([
    {
      key: 'n',
      ctrl: true,
      callback: () => setIsAddModalOpen(true),
      description: 'Add new item',
    },
    {
      key: 'k',
      ctrl: true,
      callback: () => router.push('/search'),
      description: 'Search',
    },
    {
      key: 'l',
      callback: () => router.push('/library'),
      description: 'Go to library',
    },
    {
      key: 'p',
      callback: () => router.push('/profile'),
      description: 'Go to profile',
    },
    {
      key: '?',
      callback: () => setIsShortcutsModalOpen(true),
      description: 'Show shortcuts',
    },
  ]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 pt-24">
          <MediaGridSkeleton count={6} />
        </main>
        <FloatingAddButton />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen pb-20">
        <Navbar />

        <main className="container mx-auto px-4 pt-24">
          <FadeIn direction="up" delay={0.1}>
            <header className="mb-12">
              <h1 className="text-4xl font-bold tracking-tight mb-2 text-balance">
                Good Evening, <span className="text-[var(--text-secondary)]">Langa</span>
              </h1>
              <p className="text-[var(--text-tertiary)]">
                You have {inProgressItems.length} item{inProgressItems.length !== 1 ? 's' : ''} in progress.
              </p>
            </header>
          </FadeIn>

          <FadeIn direction="up" delay={0.2}>
            <section className="mb-12 grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Books" value={stats.byType.BOOK || 0} color="var(--color-book)" delay={0} />
              <StatCard label="Games" value={stats.byType.GAME || 0} color="var(--color-game)" delay={0.1} />
              <StatCard label="Movies" value={stats.byType.MOVIE || 0} color="var(--color-movie)" delay={0.2} />
              <StatCard label="Series" value={stats.byType.SERIES || 0} color="var(--color-series)" delay={0.3} />
            </section>
          </FadeIn>

          {inProgressItems.length > 0 && (
            <section className="mb-12">
              <FadeIn direction="up" delay={0.3}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">In Progress</h2>
                  <button 
                    onClick={() => router.push('/library')}
                    className="text-sm text-[var(--accent-primary)] hover:underline transition-all hover:translate-x-1"
                  >
                    View All
                  </button>
                </div>
              </FadeIn>

              <AnimatedGrid staggerDelay={0.08}>
                {inProgressItems.map((item) => (
                  <KataCard key={item.id} item={item} />
                ))}
              </AnimatedGrid>
            </section>
          )}

          <section>
            <FadeIn direction="up" delay={0.4}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Recent Activity</h2>
                <button 
                  onClick={() => router.push('/library')}
                  className="text-sm text-[var(--accent-primary)] hover:underline transition-all hover:translate-x-1"
                >
                  View All
                </button>
              </div>
            </FadeIn>

            {recentItems.length === 0 ? (
              <FadeIn delay={0.5}>
                <EmptyState
                  icon={<BookOpen />}
                  title="No items yet"
                  description="Start building your kata by adding your first item."
                  action={{
                    label: "Add Item",
                    onClick: () => setIsAddModalOpen(true),
                  }}
                />
              </FadeIn>
            ) : (
              <AnimatedGrid staggerDelay={0.06}>
                {recentItems.map((item) => (
                  <KataCard key={item.id} item={item} />
                ))}
              </AnimatedGrid>
            )}
          </section>
        </main>

        <FloatingAddButton />
      </div>

      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
    </>
  );
}

function StatCard({ label, value, color, delay }: { label: string; value: number; color: string; delay: number }) {
  return (
    <FadeIn delay={delay} direction="up">
      <div className="group rounded-xl border border-white/5 bg-[var(--bg-secondary)] p-6 transition-all hover:border-white/10 hover:scale-105">
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        <div className="text-sm text-[var(--text-tertiary)] font-medium">{label}</div>
        <div className="mt-4 h-1 w-full rounded-full bg-white/5 overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ 
              width: `${Math.min((value / 20) * 100, 100)}%`,
              backgroundColor: color 
            }}
          />
        </div>
      </div>
    </FadeIn>
  );
}
