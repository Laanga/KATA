'use client';

import { useState } from 'react';
import { KataCard } from "@/components/media/KataCard";
import { FilterBar } from "@/components/library/FilterBar";
import { EditItemModal } from "@/components/media/EditItemModal";
import { useMediaStore, useFilteredItems } from "@/lib/store";
import { EmptyState } from "@/components/ui/EmptyState";
import { LibrarySkeleton } from "@/components/ui/Skeleton";
import { BookOpen, Grid3x3, List, Star, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { AnimatedGrid } from "@/components/AnimatedGrid";
import { FadeIn } from "@/components/FadeIn";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import CollectionsSidebar from "@/components/collections/CollectionsSidebar";
import CollectionsFilter from "@/components/collections/CollectionsFilter";
import { TYPE_COLORS, TYPE_LABELS, STATUS_LABELS, STATUS_COLORS } from "@/lib/utils/constants";
import type { MediaItem } from "@/types/media";

export default function LibraryPage() {
  const router = useRouter();
  const getStats = useMediaStore((state) => state.getStats);
  const getItemsByCollection = useMediaStore((state) => state.getItemsByCollection);
  const filteredItems = useFilteredItems();
  const isInitialized = useMediaStore((state) => state.isInitialized);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const stats = getStats();

  const displayItems = selectedCollection === 'ALL'
    ? filteredItems
    : filteredItems.filter(item =>
      getItemsByCollection(selectedCollection).some(collectionItem => collectionItem.id === item.id)
    );

  if (!isInitialized) {
    return <LibrarySkeleton />;
  }

  return (
    <>
      <div className="min-h-screen pb-nav-safe relative overflow-hidden">
        {/* Ambient glow */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '1s' }}
          />
        </div>

        <CollectionsFilter
          selectedCollection={selectedCollection}
          onCollectionSelect={setSelectedCollection}
        />

        <div className="flex pt-2 md:pt-16 relative z-10">
          {/* Sidebar de Colecciones */}
          <aside className="hidden lg:block sticky top-14 sm:top-16 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] pt-8 pl-4">
            <CollectionsSidebar
              selectedCollection={selectedCollection}
              onCollectionSelect={setSelectedCollection}
            />
          </aside>

          {/* Contenido principal */}
          <main className="flex-1 container mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
            {/* Header */}
            <FadeIn direction="up" delay={0.1}>
              <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-emerald-400/90 bg-clip-text text-transparent leading-none mb-3">
                    Tu Biblioteca
                  </h1>
                  <p className="text-sm sm:text-base text-[var(--text-secondary)]">
                    Tu colección personal de medios
                  </p>
                </div>

                <div className="liquid-glass-soft inline-flex items-center gap-2 self-start sm:self-end px-4 py-2 rounded-full border border-white/10 text-sm">
                  <span className="text-white font-semibold">{displayItems.length}</span>
                  <span className="text-[var(--text-tertiary)]">de</span>
                  <span className="text-[var(--text-secondary)]">{stats.total}</span>
                  {selectedCollection !== 'ALL' && (
                    <span className="text-[var(--text-tertiary)] text-xs ml-1">en colección</span>
                  )}
                </div>
              </div>
            </FadeIn>

            {/* Métricas */}
            <FadeIn direction="up" delay={0.15}>
              <DashboardMetrics />
            </FadeIn>

            {/* Filter row: sticky solo en escritorio (en móvil ocuparía demasiado viewport) */}
            <div className="md:sticky md:top-20 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 mb-4 md:backdrop-blur-md">
              <FadeIn direction="up" delay={0.2}>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div></div>

                  {/* Segmented Grid/List toggle */}
                  <div
                    className="liquid-glass-soft inline-flex items-center gap-1 p-1 rounded-full border border-white/10"
                    role="group"
                    aria-label="Modo de vista"
                  >
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                        viewMode === 'grid'
                          ? 'liquid-glass-active text-[var(--accent-primary)]'
                          : 'text-[var(--text-tertiary)] hover:text-white hover:bg-white/5'
                      }`}
                      aria-label="Vista de cuadrícula"
                      aria-pressed={viewMode === 'grid'}
                    >
                      <Grid3x3 size={14} />
                      <span className="hidden sm:inline">Cuadrícula</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                        viewMode === 'list'
                          ? 'liquid-glass-active text-[var(--accent-primary)]'
                          : 'text-[var(--text-tertiary)] hover:text-white hover:bg-white/5'
                      }`}
                      aria-label="Vista de lista"
                      aria-pressed={viewMode === 'list'}
                    >
                      <List size={14} />
                      <span className="hidden sm:inline">Lista</span>
                    </button>
                  </div>
                </div>
              </FadeIn>

              <FadeIn direction="up" delay={0.25}>
                <FilterBar />
              </FadeIn>
            </div>

            {/* Results */}
            <div className="mt-8">
              {displayItems.length === 0 ? (
                <FadeIn delay={0.3}>
                  <EmptyState
                    icon={<BookOpen />}
                    title={selectedCollection !== 'ALL' ? "Colección vacía" : "No se encontraron elementos"}
                    description={
                      selectedCollection !== 'ALL'
                        ? "Esta colección aún no tiene elementos. Añade algunos desde las tarjetas de tus items."
                        : "Intenta ajustar tus filtros o busca nuevos elementos para añadir a tu biblioteca."
                    }
                    action={{
                      label: "Comenzar a Buscar",
                      onClick: () => router.push('/search'),
                    }}
                  />
                </FadeIn>
              ) : viewMode === 'grid' ? (
                <AnimatedGrid staggerDelay={0.04}>
                  {displayItems.map((item) => (
                    <KataCard key={item.id} item={item} />
                  ))}
                </AnimatedGrid>
              ) : (
                <div className="space-y-3">
                  {displayItems.map((item, index) => (
                    <FadeIn key={item.id} delay={Math.min(index * 0.02, 0.4)}>
                      <div className="liquid-glass-soft group flex items-center gap-4 p-3 sm:p-4 rounded-2xl border border-white/10 hover:border-white/20 transition-all hover:scale-[1.005]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.coverUrl}
                          alt={item.title}
                          className="h-20 w-14 sm:h-24 sm:w-16 rounded-lg object-cover flex-shrink-0 ring-1 ring-white/10"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: `${TYPE_COLORS[item.type]}1f`,
                                color: TYPE_COLORS[item.type],
                                boxShadow: `inset 0 0 0 1px ${TYPE_COLORS[item.type]}40`,
                              }}
                            >
                              {TYPE_LABELS[item.type]}
                            </span>
                            <span
                              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                              style={{
                                color: STATUS_COLORS[item.status],
                                backgroundColor: 'rgba(255,255,255,0.04)',
                              }}
                            >
                              {STATUS_LABELS[item.status]}
                            </span>
                          </div>
                          <h3 className="font-bold text-white mb-0.5 truncate">{item.title}</h3>
                          <p className="text-xs sm:text-sm text-[var(--text-tertiary)] truncate">
                            {[item.author, item.platform, item.releaseYear].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        {item.rating !== null && (
                          <div className="flex items-center gap-1 text-[var(--accent-warning)] text-xs sm:text-sm font-medium px-1 sm:px-3">
                            <Star size={14} fill="currentColor" />
                            {item.rating.toFixed(1)}
                          </div>
                        )}
                        <button
                          onClick={() => setEditingItem(item)}
                          className="liquid-glass-soft flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 text-xs sm:text-sm text-white hover:border-[var(--accent-primary)]/50 hover:text-[var(--accent-primary)] transition-colors flex-shrink-0"
                          aria-label={`Editar ${item.title}`}
                        >
                          <Edit size={14} />
                          <span className="hidden sm:inline">Editar</span>
                        </button>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {editingItem && (
        <EditItemModal
          item={editingItem}
          isOpen={editingItem !== null}
          onClose={() => setEditingItem(null)}
        />
      )}
    </>
  );
}
