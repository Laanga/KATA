'use client';

import { Filter, SortAsc } from 'lucide-react';

export function FilterBar() {
    return (
        <div className="sticky top-16 z-40 flex flex-wrap items-center gap-4 border-b border-white/10 bg-[var(--bg-primary)]/80 py-4 backdrop-blur-md">
            <div className="flex items-center gap-2">
                <Filter size={18} className="text-[var(--text-tertiary)]" />
                <span className="text-sm font-medium text-[var(--text-secondary)]">Filters:</span>
            </div>

            {/* Type Filter */}
            <select className="h-9 rounded-md border border-white/10 bg-[var(--bg-secondary)] px-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none">
                <option value="all">All Types</option>
                <option value="book">Books</option>
                <option value="game">Games</option>
                <option value="movie">Movies</option>
                <option value="series">Series</option>
            </select>

            {/* Status Filter */}
            <select className="h-9 rounded-md border border-white/10 bg-[var(--bg-secondary)] px-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none">
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="in_progress">In Progress</option>
                <option value="planned">Planned</option>
            </select>

            <div className="ml-auto flex items-center gap-2">
                <SortAsc size={18} className="text-[var(--text-tertiary)]" />
                <select className="h-9 rounded-md border border-white/10 bg-[var(--bg-secondary)] px-3 text-sm text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none">
                    <option value="date_desc">Recent</option>
                    <option value="rating_desc">Highest Rated</option>
                    <option value="title_asc">Title A-Z</option>
                </select>
            </div>
        </div>
    );
}
