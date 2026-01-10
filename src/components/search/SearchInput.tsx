'use client';

import { Search } from 'lucide-react';

export function SearchInput() {
    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            <div className="relative group">
                <input
                    type="text"
                    placeholder="Search for books, games, movies..."
                    className="w-full h-14 rounded-full border border-white/10 bg-[var(--bg-secondary)] pl-14 pr-6 text-lg text-white placeholder-[var(--text-tertiary)] shadow-lg transition-all focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] focus:outline-none"
                />
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-[var(--accent-primary)] transition-colors" size={24} />
            </div>

            <div className="flex justify-center gap-2 overflow-x-auto pb-2">
                {['All', 'Books', 'Games', 'Movies', 'Series'].map((tab) => (
                    <button
                        key={tab}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${tab === 'All'
                                ? 'bg-[var(--accent-primary)] text-black'
                                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-white'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>
    );
}
