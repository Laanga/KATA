'use client';

import { Filter, SortAsc } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { useMediaStore } from '@/lib/store';
import { MediaType, MediaStatus, SortBy } from '@/types/media';
import { TYPE_LABELS, TYPE_ICONS } from '@/lib/utils/constants';

export function FilterBar() {
  const filters = useMediaStore((state) => state.filters);
  const sortBy = useMediaStore((state) => state.sortBy);
  const setFilters = useMediaStore((state) => state.setFilters);
  const setSortBy = useMediaStore((state) => state.setSortBy);

  const typeOptions = [
    { value: 'ALL', label: 'All Types' },
    ...Object.entries(TYPE_LABELS).map(([value, label]) => ({
      value,
      label: `${TYPE_ICONS[value as MediaType]} ${label}s`,
    })),
  ];

  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'READING', label: 'Reading' },
    { value: 'PLAYING', label: 'Playing' },
    { value: 'WATCHING', label: 'Watching' },
    { value: 'WANT_TO_READ', label: 'Want to Read' },
    { value: 'WANT_TO_PLAY', label: 'Want to Play' },
    { value: 'WANT_TO_WATCH', label: 'Want to Watch' },
    { value: 'DROPPED', label: 'Dropped' },
  ];

  const ratingOptions = [
    { value: 'ALL', label: 'Any Rating' },
    { value: 'HIGH', label: '⭐ 8-10' },
    { value: 'MID', label: '⭐ 5-7' },
    { value: 'LOW', label: '⭐ 0-4' },
  ];

  const sortOptions = [
    { value: 'date_added', label: 'Recently Added' },
    { value: 'date_added_asc', label: 'Oldest First' },
    { value: 'rating_desc', label: 'Highest Rated' },
    { value: 'rating_asc', label: 'Lowest Rated' },
    { value: 'title_asc', label: 'Title A-Z' },
    { value: 'title_desc', label: 'Title Z-A' },
  ];

  return (
    <div className="sticky top-16 z-40 flex flex-wrap items-center gap-4 border-b border-white/10 bg-[var(--bg-primary)]/80 py-4 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <Filter size={18} className="text-[var(--text-tertiary)]" />
        <span className="text-sm font-medium text-[var(--text-secondary)]">Filters:</span>
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
