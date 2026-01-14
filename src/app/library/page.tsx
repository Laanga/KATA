'use client';

import { useState, useEffect } from 'react';
import { Navbar } from "@/components/layout/Navbar";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { KataCard } from "@/components/media/KataCard";
import { FilterBar } from "@/components/library/FilterBar";
import { EditItemModal } from "@/components/media/EditItemModal";
import { useMediaStore, useFilteredItems } from "@/lib/store";
import { EmptyState } from "@/components/ui/EmptyState";
import { LibrarySkeleton } from "@/components/ui/Skeleton";
import { BookOpen, Grid3x3, List } from "lucide-react";
import { useRouter } from "next/navigation";
import { AnimatedGrid } from "@/components/AnimatedGrid";
import { FadeIn } from "@/components/FadeIn";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import type { MediaItem } from "@/types/media";

export default function LibraryPage() {
  const router = useRouter();
  const getStats = useMediaStore((state) => state.getStats);
  const filteredItems = useFilteredItems();
  const isInitialized = useMediaStore((state) => state.isInitialized);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mounted, setMounted] = useState(false);

  const stats = getStats();

  // Fix hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show skeleton while loading
  if (!isInitialized) {
    return (
      <>
        <Navbar />
        <LibrarySkeleton />
      </>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <Navbar />
      <BottomNavigation />

      <main className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24">
        <FadeIn direction="up" delay={0.1}>
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Tu Biblioteca</h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] mb-4 sm:mb-6">
              {filteredItems.length} de {stats.total} elementos
            </p>

            {/* Métricas */}
            <DashboardMetrics />
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.2}>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div></div>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid'
                    ? 'bg-[var(--accent-primary)] text-black'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-white'
                  }`}
                aria-label="Vista de cuadrícula"
              >
                <Grid3x3 size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list'
                    ? 'bg-[var(--accent-primary)] text-black'
                    : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-white'
                  }`}
                aria-label="Vista de lista"
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </FadeIn>

        <FadeIn direction="up" delay={0.3}>
          <FilterBar />
        </FadeIn>

        <div className="mt-8">
          {filteredItems.length === 0 ? (
            <FadeIn delay={0.3}>
              <EmptyState
                icon={<BookOpen />}
                title="No se encontraron elementos"
                description="Intenta ajustar tus filtros o busca nuevos elementos para añadir a tu biblioteca."
                action={{
                  label: "Comenzar a Buscar",
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
                      onClick={() => setEditingItem(item)}
                      className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-sm"
                    >
                      Editar
                    </button>
                  </div>
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </main>
      {editingItem && (
        <EditItemModal
          item={editingItem}
          isOpen={editingItem !== null}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  );
}
