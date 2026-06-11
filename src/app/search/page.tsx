'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  Loader2,
  Plus,
  CheckCircle,
  BookOpen,
  Film,
  Tv,
  Gamepad2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AddItemModal } from '@/components/media/AddItemModal';
import { EditItemModal } from '@/components/media/EditItemModal';
import { FadeIn } from '@/components/FadeIn';
import { useDebounce } from '@/hooks/useDebounce';
import { useMediaStore } from '@/lib/store';
import type { MediaType, MediaItem } from '@/types/media';
import { TYPE_COLORS, TYPE_LABELS } from '@/lib/utils/constants';

interface UnifiedResult {
  externalId: string | number;
  type: MediaType;
  title: string;
  year?: number;
  author?: string;
  coverUrl?: string;
  overview?: string;
  genres?: string[];
}

interface TMDBMovie {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
  genre_names?: string[];
}

interface TMDBSeries {
  id: number;
  name: string;
  first_air_date: string;
  poster_path: string | null;
  overview: string;
  genre_names?: string[];
}

interface IGDBGame {
  id: number;
  name: string;
  first_release_date: number;
  cover?: { url: string };
  summary: string;
  genres?: Array<{ name: string }>;
}

interface GoogleBookVolume {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publishedDate?: string;
    imageLinks?: { thumbnail?: string };
    description?: string;
    genre_names?: string[];
  };
}

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

async function fetchType(type: MediaType, query: string): Promise<UnifiedResult[]> {
  const endpoint = {
    BOOK: '/api/search/books',
    MOVIE: '/api/search/movies',
    SERIES: '/api/search/series',
    GAME: '/api/search/games',
  }[type];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`${endpoint}?q=${encodeURIComponent(query)}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const data = await res.json();
    if (data.error) {
      if (data.error.includes('Too many requests')) {
        toast.error(`Demasiadas búsquedas en ${TYPE_LABELS[type]}. Espera un poco.`);
      }
      return [];
    }

    if (type === 'MOVIE') {
      return (data.results || []).map((item: TMDBMovie) => ({
        externalId: item.id,
        type: 'MOVIE' as MediaType,
        title: item.title,
        year: item.release_date ? parseInt(item.release_date.split('-')[0]) : undefined,
        coverUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : undefined,
        overview: item.overview,
        genres: item.genre_names || [],
      }));
    }
    if (type === 'SERIES') {
      return (data.results || []).map((item: TMDBSeries) => ({
        externalId: item.id,
        type: 'SERIES' as MediaType,
        title: item.name,
        year: item.first_air_date ? parseInt(item.first_air_date.split('-')[0]) : undefined,
        coverUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : undefined,
        overview: item.overview,
        genres: item.genre_names || [],
      }));
    }
    if (type === 'GAME') {
      const list = Array.isArray(data) ? data : [];
      return list.map((item: IGDBGame) => ({
        externalId: item.id,
        type: 'GAME' as MediaType,
        title: item.name,
        year: item.first_release_date ? new Date(item.first_release_date * 1000).getFullYear() : undefined,
        coverUrl: item.cover?.url
          ? `https:${item.cover.url.replace('t_thumb', 't_cover_big')}`
          : undefined,
        overview: item.summary,
        genres: item.genres?.map((g) => g.name).filter(Boolean) || [],
      }));
    }
    // BOOK
    return (data.items || []).map((item: GoogleBookVolume) => ({
      externalId: item.id,
      type: 'BOOK' as MediaType,
      title: item.volumeInfo.title,
      author: item.volumeInfo.authors?.[0],
      year: item.volumeInfo.publishedDate
        ? parseInt(item.volumeInfo.publishedDate.split('-')[0])
        : undefined,
      coverUrl: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:'),
      overview: item.volumeInfo.description,
      genres: item.volumeInfo.genre_names || [],
    }));
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.warn(`Search timeout: ${type}`);
    } else {
      console.error(`Search failed: ${type}`, err);
    }
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}

export default function SearchPage() {
  const items = useMediaStore((state) => state.items);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<MediaType | 'ALL'>('ALL');
  const [results, setResults] = useState<UnifiedResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedResult, setSelectedResult] = useState<UnifiedResult | null>(null);
  const [editItem, setEditItem] = useState<MediaItem | null>(null);

  const cacheRef = useRef<Map<string, UnifiedResult[]>>(new Map());
  const lastQueryRef = useRef<string>('');

  const isInLibrary = useCallback(
    (resultTitle: string | undefined | null, type: MediaType): MediaItem | null => {
      if (!resultTitle) return null;
      const normalized = resultTitle.trim().toLowerCase();
      return (
        items.find(
          (item) => item.type === type && item.title.trim().toLowerCase() === normalized
        ) || null
      );
    },
    [items]
  );

  const handleSearch = useCallback(async (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      lastQueryRef.current = '';
      return;
    }
    if (trimmed === lastQueryRef.current) return;
    lastQueryRef.current = trimmed;

    const cacheKey = trimmed.toLowerCase();
    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setResults(cached);
      return;
    }

    setIsSearching(true);
    setResults([]);

    try {
      const types: MediaType[] = ['BOOK', 'MOVIE', 'SERIES', 'GAME'];
      const settled = await Promise.allSettled(types.map((t) => fetchType(t, trimmed)));

      const merged: UnifiedResult[] = [];
      settled.forEach((res) => {
        if (res.status === 'fulfilled') {
          merged.push(...res.value.slice(0, 8));
        }
      });

      cacheRef.current.set(cacheKey, merged);
      setTimeout(() => cacheRef.current.delete(cacheKey), 5 * 60 * 1000);

      setResults(merged);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const debouncedSearch = useDebounce((q: string) => {
    if (q.length >= 2) handleSearch(q);
    else if (q.length === 0) {
      setResults([]);
      lastQueryRef.current = '';
    }
  }, 500);

  useEffect(() => {
    debouncedSearch(searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const visibleResults =
    activeFilter === 'ALL' ? results : results.filter((r) => r.type === activeFilter);

  const handleSelect = (result: UnifiedResult) => {
    if (!result.title) return;
    const existing = isInLibrary(result.title, result.type);
    if (existing) {
      setEditItem(existing);
      return;
    }
    setSelectedResult(result);
  };

  const counts = (['BOOK', 'MOVIE', 'SERIES', 'GAME'] as MediaType[]).reduce(
    (acc, t) => {
      acc[t] = results.filter((r) => r.type === t).length;
      return acc;
    },
    {} as Record<MediaType, number>
  );

  return (
    <div className="min-h-screen pb-nav-safe">
      <main className="container mx-auto px-4 pt-8 md:pt-24 max-w-7xl">
        {/* Header */}
        <FadeIn direction="up" delay={0.1}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[var(--accent-primary)]/10 mb-4">
              <Search className="w-7 h-7 sm:w-8 sm:h-8 text-[var(--accent-primary)]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Buscar</h1>
            <p className="text-[var(--text-secondary)] text-sm sm:text-base">
              Un solo buscador para libros, películas, series y juegos
            </p>
          </div>
        </FadeIn>

        {/* Search input */}
        <FadeIn direction="up" delay={0.15}>
          <div className="relative max-w-2xl mx-auto group mb-6">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-[var(--accent-primary)] transition-colors z-10"
              size={20}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar cualquier cosa..."
              className="liquid-glass w-full rounded-full border border-white/10 pr-12 py-3.5 sm:py-4 text-base sm:text-lg text-white placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-primary)]/50 focus:ring-2 focus:ring-[var(--accent-primary)]/30 transition-all"
              style={{ paddingLeft: '3.25rem' }}
              autoFocus
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
                  <button
                    key={value}
                    onClick={() => setActiveFilter(value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 whitespace-nowrap text-sm font-medium ${
                      isActive
                        ? 'liquid-glass-active text-[var(--accent-primary)]'
                        : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/5'
                    }`}
                  >
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
                  </button>
                );
              })}
            </div>
          </div>
        </FadeIn>

        {/* Results grid */}
        {visibleResults.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
            {visibleResults.map((result, index) => {
              const TypeIcon = TYPE_ICONS[result.type];
              const inLib = isInLibrary(result.title, result.type);
              return (
                <FadeIn key={`${result.type}-${result.externalId}`} delay={Math.min(index * 0.03, 0.4)}>
                  <button
                    onClick={() => handleSelect(result)}
                    className="group w-full text-left relative aspect-[2/3] rounded-xl overflow-hidden bg-[var(--bg-secondary)] border border-white/5 hover:border-[var(--accent-primary)] transition-all hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                  >
                    {result.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={result.coverUrl}
                        alt={result.title || 'Resultado'}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                        <span className="text-4xl mb-2">?</span>
                        <span className="text-xs text-[var(--text-tertiary)]">Sin Portada</span>
                      </div>
                    )}

                    {/* Type badge - always visible */}
                    <div
                      className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-md text-[10px] font-semibold uppercase tracking-wide text-white"
                      style={{
                        background: `${TYPE_COLORS[result.type]}cc`,
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 6px rgba(0,0,0,0.3)',
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 sm:p-4">
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
                        {inLib ? 'En tu biblioteca' : 'Añadir a Biblioteca'}
                      </div>
                    </div>
                  </button>
                </FadeIn>
              );
            })}
          </div>
        )}

        {/* Empty states */}
        {searchQuery.length >= 2 && !isSearching && results.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[var(--text-tertiary)] text-lg">
              No se encontraron resultados para &quot;{searchQuery}&quot;
            </p>
          </div>
        )}

        {searchQuery.length === 0 && (
          <FadeIn direction="up" delay={0.25}>
            <div className="text-center py-20 text-[var(--text-tertiary)]">
              <p className="text-lg">Empieza a escribir para buscar en las 4 categorías a la vez.</p>
            </div>
          </FadeIn>
        )}
      </main>

      {/* Add modal */}
      {selectedResult && !editItem && (
        <AddItemModal
          isOpen={!!selectedResult}
          onClose={() => setSelectedResult(null)}
          prefilledType={selectedResult.type}
          initialData={{
            title: selectedResult.title,
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
