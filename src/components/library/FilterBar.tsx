'use client';

import { Filter, SortAsc, X } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { useMediaStore } from '@/lib/store';
import { MediaType, SortBy, GroupedStatus } from '@/types/media';
import { TYPE_LABELS, TYPE_ICONS } from '@/lib/utils/constants';

export function FilterBar() {
  const filters = useMediaStore((state) => state.filters);
  const sortBy = useMediaStore((state) => state.sortBy);
  const items = useMediaStore((state) => state.items);
  const setFilters = useMediaStore((state) => state.setFilters);
  const setSortBy = useMediaStore((state) => state.setSortBy);
  const resetFilters = useMediaStore((state) => state.resetFilters);

  // Get unique genres from all items
  const allGenres = Array.from(
    new Set(
      items
        .flatMap(item => item.genres || [])
        .filter(Boolean)
        .sort()
    )
  );

  const genreOptions = [
    { value: 'ALL', label: 'Todos los Géneros' },
    ...allGenres.map(genre => ({
      value: genre,
      label: genre,
    })),
  ];

  const hasActiveFilters = 
    filters.type !== 'ALL' || 
    filters.status !== 'ALL' || 
    filters.rating !== 'ALL' ||
    filters.genre !== 'ALL' ||
    sortBy !== 'date_added';

  const typeOptions = [
    { value: 'ALL', label: 'Todos los Tipos' },
    ...Object.entries(TYPE_LABELS).map(([value, label]) => ({
      value,
      label: `${TYPE_ICONS[value as MediaType]} ${label}s`,
    })),
  ];

  const statusOptions = [
    { value: 'ALL', label: 'Todos los Estados' },
    { value: 'WANT_TO_CONSUME', label: 'Pendientes' },
    { value: 'IN_PROGRESS', label: 'En Progreso' },
    { value: 'COMPLETED', label: 'Completado' },
  ];

  const ratingOptions = [
    { value: 'ALL', label: 'Cualquier Puntuación' },
    { value: 'HIGH', label: '⭐ 4-5 estrellas' },
    { value: 'MID', label: '⭐ 3 estrellas' },
    { value: 'LOW', label: '⭐ 1-2 estrellas' },
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

  return (
    <div className="sticky top-16 z-40 flex flex-wrap items-center gap-4 border-b border-white/10 bg-[var(--bg-primary)]/80 py-4 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <Filter size={18} className="text-[var(--text-tertiary)]" />
        <span className="text-sm font-medium text-[var(--text-secondary)]">Filtros:</span>
      </div>

      {/* Type Filter */}
      <Select
        value={filters.type}
        onChange={(value) => setFilters({ type: value as MediaType | 'ALL' })}
        options={typeOptions}
      />

      {/* Status Filter */}
      <Select
        value={filters.status}
        onChange={(value) => setFilters({ status: value as GroupedStatus | 'ALL' })}
        options={statusOptions}
      />

      {/* Rating Filter */}
      <Select
        value={filters.rating}
        onChange={(value) => setFilters({ rating: value as 'ALL' | 'HIGH' | 'MID' | 'LOW' })}
        options={ratingOptions}
      />

      {/* Genre Filter */}
      {allGenres.length > 0 && (
        <Select
          value={filters.genre}
          onChange={(value) => setFilters({ genre: value })}
          options={genreOptions}
        />
      )}

      {/* Reset Button */}
      {hasActiveFilters && (
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 rounded-md border border-white/10 bg-[var(--bg-secondary)] px-3 py-1.5 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-primary)] hover:text-white"
        >
          <X size={14} />
          Restablecer
        </button>
      )}

      <div className="ml-auto flex items-center gap-2">
        <SortAsc size={18} className="text-[var(--text-tertiary)]" />
        <Select
          value={sortBy}
          onChange={(value) => setSortBy(value as SortBy)}
          options={sortOptions}
        />
      </div>
    </div>
  );
}
