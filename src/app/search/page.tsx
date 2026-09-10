'use client';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Choice';
import { TextInput } from '@/components/ui/Field';

import { useState } from 'react';
import { Search, Loader2, Plus, CheckCircle, BookOpen, Film, Tv, Gamepad2 } from 'lucide-react';
import { AddItemModal } from '@/components/media/AddItemModal';
import { EditItemModal } from '@/components/media/EditItemModal';
import { useOnboarding } from '@/components/OnboardingProvider';
import { useRouter } from 'next/navigation';
import { track } from '@vercel/analytics';
import { MediaCover } from '@/components/media/MediaCover';
import { FadeIn } from '@/components/FadeIn';
import { useMediaSearch } from '@/hooks/useMediaSearch';
import type { MediaResult as UnifiedResult } from '@/lib/media/results';
import { sameMedia } from '@/lib/utils/mediaIdentity';
import { useMediaStore } from '@/lib/store';
import type { MediaType, MediaItem } from '@/types/media';
import { TYPE_COLORS, TYPE_LABELS } from '@/lib/utils/constants';

const TYPE_FILTERS: Array<{
  value: MediaType | 'ALL';
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }> | null;
}> = [
  { value: 'ALL', label: 'Todos', Icon: null },
  { value: 'BOOK', label: 'Libros', Icon: BookOpen },
  { value: 'MOVIE', label: 'Películas', Icon: Film },
  { value: 'SERIES', label: 'Series', Icon: Tv },
  { value: 'GAME', label: 'Juegos', Icon: Gamepad2 },
];

const TYPE_ICONS: Record<MediaType, React.ComponentType<{ size?: number; className?: string }>> = {
  BOOK: BookOpen,
  MOVIE: Film,
  SERIES: Tv,
  GAME: Gamepad2,
};

export default function SearchPage() {
  const { preferences } = useOnboarding();
  const guided =
    !!preferences &&
    ['pending', 'in_progress'].includes(preferences.onboarding_status) &&
    preferences.onboarding_step === 2;
  const initialType = guided ? preferences?.preferred_type || 'MOVIE' : 'ALL';
  return (
    <SearchContent
      key={guided ? `guided-${initialType}` : 'normal'}
      guided={guided}
      initialType={initialType}
    />
  );
}

function SearchContent({
  guided,
  initialType,
}: {
  guided: boolean;
  initialType: MediaType | 'ALL';
}) {
  const { save, preferences } = useOnboarding();
  const router = useRouter();
  const [guideError, setGuideError] = useState('');
  const [guideBusy, setGuideBusy] = useState(false);
  const examples: Record<MediaType, string> = {
    MOVIE: 'Interstellar',
    SERIES: 'Breaking Bad',
    BOOK: 'El principito',
    GAME: 'Stardew Valley',
  };
  const saved = async (item: MediaItem) => {
    await save({ onboarding_status: 'in_progress', onboarding_step: 3, first_item_id: item.id });
    useMediaStore.getState().resetFilters();
    useMediaStore.getState().setSearchQuery('');
    track('onboarding_first_item_saved', { type: item.type });
    router.replace('/library');
  };
  const skip = async () => {
    if (guideBusy) return;
    setGuideBusy(true);
    setGuideError('');
    try {
      await save({ onboarding_status: 'skipped', finished_at: new Date().toISOString() });
      track('onboarding_skipped', { step: 2 });
    } catch {
      setGuideError('No pudimos guardar tu preferencia. Puedes seguir buscando o reintentarlo.');
    } finally {
      setGuideBusy(false);
    }
  };
  const items = useMediaStore((state) => state.items);

  const {
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    results,
    isSearching,
    errors,
    retry,
  } = useMediaSearch(initialType);
  const [selectedResult, setSelectedResult] = useState<UnifiedResult | null>(null);
  const [editItem, setEditItem] = useState<MediaItem | null>(null);
  const visibleResults = results;
  const isInLibrary = (result: UnifiedResult) =>
    items.find((item) => sameMedia(item, result)) || null;

  const handleSelect = (result: UnifiedResult) => {
    if (!result.title) return;
    const existing = isInLibrary(result);
    if (existing) {
      if (guided) {
        if (guideBusy) return;
        setGuideBusy(true);
        setGuideError('');
        void saved(existing)
          .catch(() => setGuideError('El título sigue guardado. Reintenta para continuar.'))
          .finally(() => setGuideBusy(false));
      } else setEditItem(existing);
      return;
    }
    setSelectedResult(result);
  };

  const counts = (['BOOK', 'MOVIE', 'SERIES', 'GAME'] as MediaType[]).reduce(
    (acc, t) => {
      acc[t] = results.filter((r) => r.type === t).length;
      return acc;
    },
    {} as Record<MediaType, number>,
  );

  return (
    <div className="min-h-screen pb-nav-safe">
      <main className="container mx-auto px-4 pt-8 md:pt-24 max-w-7xl">
        {guided ? (
          <section
            aria-label="Tu primer título"
            className="kata-panel kata-panel--accent max-w-2xl mx-auto mb-5"
          >
            <div className="flex items-center justify-between gap-4 mb-3">
              <span className="text-xs text-emerald-300">2 de 3 · Tu primera historia</span>
              <Button variant="ghost" size="sm" onClick={skip} disabled={guideBusy}>
                Ahora no
              </Button>
            </div>
            <h1 className="kata-title-page">Empieza por algo que te guste.</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              {results.length
                ? 'Toca un título para guardarlo. Podrás cambiar su estado cuando quieras.'
                : 'Busca algo que estés disfrutando o que quieras descubrir.'}
            </p>
          </section>
        ) : (
          <>
            {/* Header */}
            <FadeIn direction="up" delay={0.1}>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--accent-primary)]/10 mb-4">
                  <Search className="w-7 h-7 sm:w-8 sm:h-8 text-[var(--accent-primary)]" />
                </div>
                <h1 className="kata-title-page">Buscar</h1>
                <p className="text-[var(--text-secondary)] text-sm sm:text-base">
                  Un solo buscador para libros, películas, series y juegos
                </p>
              </div>
            </FadeIn>
          </>
        )}
        {guideError && (
          <p role="alert" className="max-w-2xl mx-auto mb-4 text-sm text-red-300">
            {guideError}
          </p>
        )}
        {/* Search input */}
        <FadeIn direction="up" delay={0.15}>
          <div className="relative max-w-2xl mx-auto group mb-6">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-[var(--accent-primary)] transition-colors z-10"
              size={20}
            />
            <TextInput
              type="text"
              aria-label="Buscar título"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar cualquier cosa..."
              className="w-full pr-12"
              style={{ paddingLeft: '3.25rem' }}
              autoFocus={
                preferences?.onboarding_step !== 1 ||
                preferences?.onboarding_status === 'skipped' ||
                preferences?.onboarding_status === 'completed'
              }
            />
            {isSearching && (
              <Loader2
                className="absolute right-5 top-1/2 -translate-y-1/2 animate-spin text-[var(--accent-primary)] z-10"
                size={20}
              />
            )}
          </div>
        </FadeIn>

        {/* Type filter chips */}
        <FadeIn direction="up" delay={0.2}>
          <div className="mb-8 flex justify-center">
            <div className="liquid-glass-soft inline-flex items-center gap-1 p-1.5 rounded-full border border-white/10 overflow-x-auto scrollbar-hide max-w-full">
              {TYPE_FILTERS.map(({ value, label, Icon }) => {
                const isActive = activeFilter === value;
                const count = value === 'ALL' ? results.length : counts[value as MediaType];
                return (
                  <Chip key={value} onClick={() => setActiveFilter(value)} selected={isActive}>
                    {Icon && <Icon size={16} className={isActive ? '' : 'opacity-70'} />}
                    <span>{label}</span>
                    {results.length > 0 && (
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? 'bg-[var(--accent-primary)]/20'
                            : 'bg-white/5 text-[var(--text-tertiary)]'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </Chip>
                );
              })}
            </div>
          </div>
        </FadeIn>

        {errors.length > 0 && (
          <div role="status" className="mb-6 rounded-xl border border-amber-500/30 p-4">
            <p>{errors.join(' ')}</p>
            <Button variant="ghost" size="sm" onClick={retry}>
              Reintentar proveedores no disponibles
            </Button>
          </div>
        )}
        {/* Results grid */}
        {visibleResults.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
            {visibleResults.map((result, index) => {
              const TypeIcon = TYPE_ICONS[result.type];
              const inLib = isInLibrary(result);
              return (
                <FadeIn
                  key={`${result.type}-${result.externalId}`}
                  delay={Math.min(index * 0.03, 0.4)}
                >
                  <button
                    onClick={() => handleSelect(result)}
                    disabled={guideBusy}
                    aria-label={`${inLib && guided ? 'Usar' : 'Añadir'} ${result.title}`}
                    className="group w-full text-left relative aspect-[2/3] rounded-xl overflow-hidden bg-[var(--bg-secondary)] border border-white/5 hover:border-[var(--accent-primary)] transition-all hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                  >
                    <MediaCover
                      src={result.coverUrl || ''}
                      alt=""
                      fill
                      sizes="(max-width:768px) 45vw, 220px"
                      className="object-cover"
                    />

                    {/* Type badge - always visible */}
                    <div
                      className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-md text-[10px] font-semibold uppercase tracking-wide text-white"
                      style={{
                        background: `${TYPE_COLORS[result.type]}cc`,
                        boxShadow:
                          'inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 6px rgba(0,0,0,0.3)',
                      }}
                    >
                      <TypeIcon size={10} />
                      <span>{TYPE_LABELS[result.type]}</span>
                    </div>

                    {/* Already-in-library indicator */}
                    {inLib && (
                      <div className="absolute top-2 right-2 bg-[var(--accent-primary)] rounded-full p-1.5 shadow-lg">
                        <CheckCircle size={14} className="text-white" />
                      </div>
                    )}

                    {/* Overlay de info: siempre visible en móvil (no hay hover), hover en escritorio */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-100 transition-opacity flex flex-col justify-end p-3 sm:p-4">
                      <h3 className="font-bold text-white leading-tight line-clamp-2">
                        {result.title || 'Sin título'}
                      </h3>
                      <p className="text-sm text-[var(--accent-primary)] mt-1">
                        {result.year}
                        {result.author && ` • ${result.author}`}
                      </p>
                      {result.genres && result.genres.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {result.genres.slice(0, 2).map((genre, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white/90 backdrop-blur-sm"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      )}
                      <div
                        className={`mt-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider ${
                          inLib ? 'text-[var(--accent-primary)]' : 'text-white/80'
                        }`}
                      >
                        {inLib ? <CheckCircle size={14} /> : <Plus size={14} />}
                        {inLib
                          ? guided
                            ? 'Usar este título'
                            : 'En tu biblioteca'
                          : 'Guardar título'}
                      </div>
                    </div>
                  </button>
                </FadeIn>
              );
            })}
          </div>
        )}

        {/* Empty states */}
        {searchQuery.length >= 2 && !isSearching && errors.length === 0 && results.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[var(--text-tertiary)] text-lg">
              No se encontraron resultados para &quot;{searchQuery}&quot;
            </p>
          </div>
        )}

        {searchQuery.length === 0 && (
          <div className="max-w-2xl mx-auto text-center py-5 text-[var(--text-secondary)]">
            {guided ? (
              <>
                <p className="text-sm mb-3">¿Una idea para probar?</p>
                <Button
                  variant="outline"
                  onClick={() =>
                    setSearchQuery(examples[activeFilter === 'ALL' ? 'MOVIE' : activeFilter])
                  }
                >
                  Buscar «{examples[activeFilter === 'ALL' ? 'MOVIE' : activeFilter]}»
                </Button>
                <p className="text-xs mt-6">
                  Puedes cambiar de categoría o explorar la app libremente.
                </p>
              </>
            ) : (
              <p>Escribe un título para empezar a buscar.</p>
            )}
          </div>
        )}
      </main>

      {/* Add modal */}
      {selectedResult && !editItem && (
        <AddItemModal
          isOpen={!!selectedResult}
          onClose={() => setSelectedResult(null)}
          prefilledType={selectedResult.type}
          gentle={guided}
          onSaved={guided ? saved : undefined}
          initialData={{
            title: selectedResult.title,
            provider: selectedResult.provider,
            externalId: selectedResult.externalId,
            platform: selectedResult.platform,
            coverUrl: selectedResult.coverUrl,
            releaseYear: selectedResult.year,
            author: selectedResult.author,
            genres: selectedResult.genres || [],
          }}
        />
      )}

      {/* Edit modal */}
      {editItem && (
        <EditItemModal item={editItem} isOpen={true} onClose={() => setEditItem(null)} />
      )}
    </div>
  );
}
