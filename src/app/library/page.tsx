'use client';

import { useState } from 'react';
import { Navbar } from "@/components/layout/Navbar";
import { KataCard } from "@/components/media/KataCard";
import { FilterBar } from "@/components/library/FilterBar";
import { useMediaStore } from "@/lib/store";
import { EmptyState } from "@/components/ui/EmptyState";
import { BookOpen, Grid3x3, List } from "lucide-react";
import { useRouter } from "next/navigation";
import { AnimatedGrid } from "@/components/AnimatedGrid";
import { FadeIn } from "@/components/FadeIn";
import { FloatingAddButton } from "@/components/FloatingAddButton";
import { AddItemModal } from "@/components/media/AddItemModal";
import { ShortcutsModal } from "@/components/ShortcutsModal";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

export default function LibraryPage() {
  const router = useRouter();
  const getFilteredItems = useMediaStore((state) => state.getFilteredItems);
  const getStats = useMediaStore((state) => state.getStats);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  
  const filteredItems = getFilteredItems();
  const stats = getStats();

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
      key: 'h',
      callback: () => router.push('/'),
      description: 'Go to home',
    },
    {
      key: 'p',
      callback: () => router.push('/profile'),
      description: 'Go to profile',
    },
    {
      key: 'v',
      callback: () => setViewMode(viewMode === 'grid' ? 'list' : 'grid'),
      description: 'Toggle view mode',
    },
    {
      key: '?',
      callback: () => setIsShortcutsModalOpen(true),
      description: 'Show shortcuts',
    },
  ]);

  return (
    <>
      <div className="min-h-screen pb-20">
        <Navbar />

        <main className="container mx-auto px-4 pt-24">
          <FadeIn direction="up" delay={0.1}>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Your Library</h1>
                <p className="text-[var(--text-secondary)] mt-1">
                  {filteredItems.length} of {stats.total} items
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-[var(--accent-primary)] text-black'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-white'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid3x3 size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-[var(--accent-primary)] text-black'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-white'
                  }`}
                  aria-label="List view"
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={0.2}>
            <FilterBar />
          </FadeIn>

          <div className="mt-8">
            {filteredItems.length === 0 ? (
              <FadeIn delay={0.3}>
                <EmptyState
                  icon={<BookOpen />}
                  title="No items found"
                  description="Try adjusting your filters or add new items to your library."
                  action={{
                    label: "Start Searching",
                    onClick: () => router.push('/search'),
                  }}
                />
              </FadeIn>
            ) : viewMode === 'grid' ? (
              <AnimatedGrid staggerDelay={0.04}>
                {filteredItems.map((item) => (
                  <KataCard key={item.id} item={item} />
                ))}
              </AnimatedGrid>
            ) : (
              <div className="space-y-3">
                {filteredItems.map((item, index) => (
                  <FadeIn key={item.id} delay={index * 0.02}>
                    <div className="flex items-center gap-4 p-4 rounded-lg border border-white/5 bg-[var(--bg-secondary)] hover:border-white/10 transition-all hover:scale-[1.01]">
                      <img
                        src={item.coverUrl}
                        alt={item.title}
                        className="h-24 w-16 rounded object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-white mb-1">{item.title}</h3>
                        <p className="text-sm text-[var(--text-secondary)] mb-2">
                          {item.author || item.platform || item.releaseYear}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-xs px-2 py-1 rounded-full bg-white/5">
                            {item.type}
                          </span>
                          {item.rating && (
                            <span className="text-xs text-[var(--accent-warning)]">
                              {item.rating}/10
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {}}
                        className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-sm"
                      >
                        Edit
                      </button>
                    </div>
                  </FadeIn>
                ))}
              </div>
            )}
          </div>
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
