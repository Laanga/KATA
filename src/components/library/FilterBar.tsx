'use client';

import { Film, Tv, BookOpen, Gamepad2, Star, X, SortAsc, ChevronDown } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { useMediaStore } from '@/lib/store';
import { MediaType, SortBy, GroupedStatus } from '@/types/media';
import { TYPE_COLORS } from '@/lib/utils/constants';
import { useMemo } from 'react';
import { cn } from '@/lib/utils/cn';

export function FilterBar() {
  const filters = useMediaStore((state) => state.filters);
  const sortBy = useMediaStore((state) => state.sortBy);
  const items = useMediaStore((state) => state.items);
  const setFilters = useMediaStore((state) => state.setFilters);
  const setSortBy = useMediaStore((state) => state.setSortBy);
  const resetFilters = useMediaStore((state) => state.resetFilters);

  const allGenres = useMemo(() => {
    const genres = items
      .flatMap((item) => item.genres || [])
      .filter(Boolean);
    
    return Array.from(new Set(genres)).sort();
  }, [items]);

  const hasActiveFilters = 
    filters.type !== 'ALL' || 
    filters.status !== 'ALL' || 
    filters.rating !== 'ALL' ||
    filters.genre !== 'ALL' ||
    sortBy !== 'date_added';

  const typeConfig: Record<MediaType | 'ALL', { label: string; icon: React.ReactNode }> = {
    ALL: { label: 'Todos', icon: <Film size={16} /> },
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
    { value: 'MID', label: '3 estrellas', stars: 3 },
    { value: 'LOW', label: '1-2 estrellas', stars: 1 },
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
    <div className="relative">
      <select
        value={filters.genre}
        onChange={(e) => setFilters({ genre: e.target.value })}
        className="
          h-8 appearance-none rounded-lg border border-white/10 bg-[var(--bg-secondary)] 
          pl-3 pr-8 text-xs text-[var(--text-primary)] transition-all
          hover:border-white/20 focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]
          cursor-pointer
        "
      >
        <option value="ALL">Todos los géneros</option>
        {allGenres.map((genre) => (
          <option key={genre} value={genre}>{genre}</option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
    </div>
  ) : (
    <div className="flex gap-1 p-1 bg-[var(--bg-secondary)] rounded-lg">
      {[
        { value: 'ALL', label: 'Todos' },
        ...allGenres.map(genre => ({ value: genre, label: genre }))
      ].map((option) => (
        <button
          key={option.value}
          onClick={() => setFilters({ genre: option.value })}
          className={`
            px-3 py-1.5 rounded-md text-xs font-medium transition-all
            ${filters.genre === option.value
              ? 'bg-white/10 text-white'
              : 'text-[var(--text-tertiary)] hover:text-white'
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-4 border-b border-white/10 bg-[var(--bg-primary)] py-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-[var(--text-secondary)]">Filtros:</span>

        <div className="flex gap-1 p-1 bg-[var(--bg-secondary)] rounded-lg">
          {(['ALL', 'MOVIE', 'SERIES', 'BOOK', 'GAME'] as (MediaType | 'ALL')[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilters({ type: type as MediaType | 'ALL' })}
              className={`
                relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                ${filters.type === type 
                  ? 'text-white shadow-lg' 
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                }
              `}
              style={{
                backgroundColor: filters.type === type && type !== 'ALL' ? TYPE_COLORS[type as MediaType] : 'transparent',
              }}
            >
              {typeConfig[type].icon}
              <span className="hidden sm:inline">{typeConfig[type].label}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-1 p-1 bg-[var(--bg-secondary)] rounded-lg">
          {statusConfig.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilters({ status: option.value as GroupedStatus | 'ALL' })}
              className={`
                px-3 py-1.5 rounded-md text-xs font-medium transition-all
                ${filters.status === option.value
                  ? 'bg-white/10 text-white'
                  : 'text-[var(--text-tertiary)] hover:text-white'
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1 p-1 bg-[var(--bg-secondary)] rounded-lg">
          {ratingConfig.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilters({ rating: option.value as 'ALL' | 'HIGH' | 'MID' | 'LOW' })}
              className={`
                flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all
                ${filters.rating === option.value
                  ? 'bg-white/10 text-white'
                  : 'text-[var(--text-tertiary)] hover:text-white'
                }
              `}
            >
              {option.label}
              {option.stars > 0 && <Star size={10} className={cn('fill-current', option.stars >= 4 ? 'text-[var(--accent-warning)]' : 'text-[var(--text-tertiary)]')} />}
            </button>
          ))}
        </div>

        {allGenres.length > 0 && GenreSection}

        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-md border border-white/10 bg-[var(--bg-secondary)] px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-primary)] hover:text-white"
          >
            <X size={12} />
            Restablecer
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <SortAsc size={16} className="text-[var(--text-tertiary)]" />
          <Select
            value={sortBy}
            onChange={(value) => setSortBy(value as SortBy)}
            options={sortOptions}
            className="w-auto min-w-[180px]"
          />
        </div>
      </div>
    </div>
  );
}
