'use client';

import { Filter, SortAsc, X } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { useMediaStore } from '@/lib/store';
import { MediaType, MediaStatus, SortBy } from '@/types/media';
import { TYPE_LABELS, TYPE_ICONS } from '@/lib/utils/constants';

export function FilterBar() {
  const filters = useMediaStore((state) => state.filters);
  const sortBy = useMediaStore((state) => state.sortBy);
  const setFilters = useMediaStore((state) => state.setFilters);
  const setSortBy = useMediaStore((state) => state.setSortBy);
  const resetFilters = useMediaStore((state) => state.resetFilters);

  const hasActiveFilters = 
    filters.type !== 'ALL' || 
    filters.status !== 'ALL' || 
    filters.rating !== 'ALL' ||
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
    { value: 'COMPLETED', label: 'Completado' },
    { value: 'READING', label: 'Leyendo' },
    { value: 'PLAYING', label: 'Jugando' },
    { value: 'WATCHING', label: 'Viendo' },
    { value: 'WANT_TO_READ', label: 'Quiero Leer' },
    { value: 'WANT_TO_PLAY', label: 'Quiero Jugar' },
    { value: 'WANT_TO_WATCH', label: 'Quiero Ver' },
    { value: 'DROPPED', label: 'Abandonado' },
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
        onChange={(value) => setFilters({ status: value as MediaStatus | 'ALL' })}
        options={statusOptions}
      />

      {/* Rating Filter */}
      <Select
        value={filters.rating}
        onChange={(value) => setFilters({ rating: value as 'ALL' | 'HIGH' | 'MID' | 'LOW' })}
        options={ratingOptions}
      />

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
