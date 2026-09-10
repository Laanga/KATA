'use client';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Choice';
import { NativeSelect } from '@/components/ui/Field';

import {
  Film,
  Tv,
  BookOpen,
  Gamepad2,
  Star,
  X,
  SortAsc,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
} from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { useMediaStore } from '@/lib/store';
import { MediaType, SortBy, GroupedStatus } from '@/types/media';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';

export function FilterBar() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const check = () => {
      setCanScrollLeft(el.scrollLeft > 1);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    };

    check();
    el.addEventListener('scroll', check, { passive: true });
    const resizeObserver = new ResizeObserver(check);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener('scroll', check);
      resizeObserver.disconnect();
    };
  }, []);

  const filters = useMediaStore((state) => state.filters);
  const sortBy = useMediaStore((state) => state.sortBy);
  const items = useMediaStore((state) => state.items);
  const setFilters = useMediaStore((state) => state.setFilters);
  const setSortBy = useMediaStore((state) => state.setSortBy);
  const resetFilters = useMediaStore((state) => state.resetFilters);

  const allGenres = useMemo(() => {
    const genres = items.flatMap((item) => item.genres || []).filter(Boolean);

    return Array.from(new Set(genres)).sort();
  }, [items]);

  const hasActiveFilters =
    filters.type !== 'ALL' ||
    filters.status !== 'ALL' ||
    filters.rating !== 'ALL' ||
    filters.genre !== 'ALL' ||
    sortBy !== 'date_added';

  const typeConfig: Record<MediaType | 'ALL', { label: string; icon: React.ReactNode }> = {
    ALL: { label: 'Todos', icon: <LayoutGrid size={16} /> },
    MOVIE: { label: 'Películas', icon: <Film size={16} /> },
    SERIES: { label: 'Series', icon: <Tv size={16} /> },
    BOOK: { label: 'Libros', icon: <BookOpen size={16} /> },
    GAME: { label: 'Juegos', icon: <Gamepad2 size={16} /> },
  };

  const statusConfig = [
    { value: 'ALL', label: 'Todos' },
    { value: 'WANT_TO_CONSUME', label: 'Pendientes' },
    { value: 'IN_PROGRESS', label: 'En Progreso' },
    { value: 'COMPLETED', label: 'Completado' },
  ];

  const ratingConfig = [
    { value: 'ALL', label: 'Todas', stars: 0 },
    { value: 'HIGH', label: '4-5 estrellas', stars: 4 },
    { value: 'MID', label: '2,5-3,5 estrellas', stars: 3 },
    { value: 'LOW', label: '0-2 estrellas', stars: 1 },
  ];

  const sortOptions = [
    { value: 'date_added', label: 'Añadidos Recientemente' },
    { value: 'date_added_asc', label: 'Más Antiguos Primero' },
    { value: 'rating_desc', label: 'Mejor Puntuados' },
    { value: 'rating_asc', label: 'Peor Puntuados' },
    { value: 'title_asc', label: 'Título A-Z' },
    { value: 'title_desc', label: 'Título Z-A' },
  ];

  const handleReset = () => {
    resetFilters();
    setSortBy('date_added');
  };

  const shouldUseSelectForGenres = allGenres.length > 5;

  const GenreSection = shouldUseSelectForGenres ? (
    <div className="relative flex-shrink-0">
      <NativeSelect
        aria-label="Género"
        value={filters.genre}
        onChange={(e) => setFilters({ genre: e.target.value })}
        className="pl-3 pr-8"
      >
        <option value="ALL">Todos los géneros</option>
        {allGenres.map((genre) => (
          <option key={genre} value={genre}>
            {genre}
          </option>
        ))}
      </NativeSelect>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
      />
    </div>
  ) : (
    <div className="liquid-glass-soft flex flex-shrink-0 gap-1 p-1 rounded-full border border-white/10">
      {[
        { value: 'ALL', label: 'Todos' },
        ...allGenres.map((genre) => ({ value: genre, label: genre })),
      ].map((option) => (
        <Chip
          selected={filters.genre === option.value}
          key={option.value}
          onClick={() => setFilters({ genre: option.value })}
        >
          {option.label}
        </Chip>
      ))}
    </div>
  );

  // Funde los extremos de la fila para sugerir que hay más contenido por scroll.
  // Es un mask (no un gradiente pintado), así que respeta el fondo de la página.
  const scrollMask = `linear-gradient(to right, ${
    canScrollLeft ? 'transparent, black 28px' : 'black'
  }, ${canScrollRight ? 'black calc(100% - 36px), transparent' : 'black'})`;

  return (
    <div className="relative flex flex-col gap-4 border-b border-white/10 py-3 sm:py-4">
      {/* En móvil los grupos de filtros van en una fila con scroll horizontal; en sm+ hacen wrap */}
      <div
        ref={scrollRef}
        className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1 sm:mx-0 sm:px-0 sm:pb-0 sm:flex-wrap sm:overflow-visible"
        style={{ maskImage: scrollMask, WebkitMaskImage: scrollMask }}
      >
        <span className="hidden sm:inline text-sm font-medium text-[var(--text-secondary)] flex-shrink-0">
          Filtros:
        </span>

        <div className="liquid-glass-soft flex flex-shrink-0 gap-1 p-1 rounded-full border border-white/10">
          {(['ALL', 'MOVIE', 'SERIES', 'BOOK', 'GAME'] as (MediaType | 'ALL')[]).map((type) => (
            <Chip
              key={type}
              aria-label={typeConfig[type].label}
              selected={filters.type === type}
              onClick={() => setFilters({ type: type as MediaType | 'ALL' })}
            >
              {typeConfig[type].icon}
              <span className="hidden sm:inline">{typeConfig[type].label}</span>
            </Chip>
          ))}
        </div>

        <div className="liquid-glass-soft flex flex-shrink-0 gap-1 p-1 rounded-full border border-white/10">
          {statusConfig.map((option) => (
            <Chip
              selected={filters.status === option.value}
              key={option.value}
              onClick={() => setFilters({ status: option.value as GroupedStatus | 'ALL' })}
            >
              {option.label}
            </Chip>
          ))}
        </div>

        <div className="liquid-glass-soft flex flex-shrink-0 gap-1 p-1 rounded-full border border-white/10">
          {ratingConfig.map((option) => (
            <Chip
              selected={filters.rating === option.value}
              key={option.value}
              onClick={() => setFilters({ rating: option.value as 'ALL' | 'HIGH' | 'MID' | 'LOW' })}
            >
              {option.label}
              {option.stars > 0 && (
                <Star
                  size={10}
                  className={cn(
                    'fill-current',
                    option.stars >= 4
                      ? 'text-[var(--accent-warning)]'
                      : 'text-[var(--text-tertiary)]',
                  )}
                />
              )}
            </Chip>
          ))}
        </div>

        {allGenres.length > 0 && GenreSection}

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <X size={12} />
            Restablecer
          </Button>
        )}

        <div className="ml-auto flex flex-shrink-0 items-center gap-2">
          <SortAsc size={16} className="text-[var(--text-tertiary)]" />
          <Select
            aria-label="Ordenar biblioteca"
            value={sortBy}
            onChange={(value) => setSortBy(value as SortBy)}
            options={sortOptions}
            className="w-auto min-w-[160px] sm:min-w-[180px]"
          />
        </div>
      </div>

      {/* Pista de scroll en móvil: chevron flotante mientras quede contenido a la derecha */}
      {canScrollRight && (
        <div className="pointer-events-none absolute -right-3 top-1/2 -translate-y-1/2 sm:hidden">
          <ChevronRight size={16} className="animate-pulse text-[var(--text-tertiary)]" />
        </div>
      )}
    </div>
  );
}
