'use client';

import { useState } from 'react';
import { Search, BookOpen, Gamepad2, Film, Tv } from 'lucide-react';
import { MediaType } from '@/types/media';

interface SearchInputProps {
  onSearch: (query: string, type: MediaType | 'ALL') => void;
}

export function SearchInput({ onSearch }: SearchInputProps) {
  const [activeTab, setActiveTab] = useState<MediaType | 'ALL'>('ALL');
  const [query, setQuery] = useState('');

  const handleInputChange = (value: string) => {
    setQuery(value);
    onSearch(value, activeTab);
  };

  const handleTabChange = (tab: MediaType | 'ALL') => {
    setActiveTab(tab);
    onSearch(query, tab);
  };

  const tabs: Array<{ label: string; value: MediaType | 'ALL'; icon: React.ReactNode }> = [
    { label: 'All', value: 'ALL', icon: <Search size={14} /> },
    { label: 'Books', value: 'BOOK', icon: <BookOpen size={14} /> },
    { label: 'Games', value: 'GAME', icon: <Gamepad2 size={14} /> },
    { label: 'Movies', value: 'MOVIE', icon: <Film size={14} /> },
    { label: 'Series', value: 'SERIES', icon: <Tv size={14} /> },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="relative group">
        <input
          type="text"
          placeholder="Search for books, games, movies..."
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          className="w-full h-14 rounded-full border border-white/10 bg-[var(--bg-secondary)] pl-14 pr-6 text-lg text-white placeholder-[var(--text-tertiary)] shadow-lg transition-all focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] focus:outline-none"
        />
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] group-focus-within:text-[var(--accent-primary)] transition-colors" size={24} />
      </div>

      <div className="flex justify-center gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
              tab.value === activeTab
                ? 'bg-[var(--accent-primary)] text-black'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-white'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
