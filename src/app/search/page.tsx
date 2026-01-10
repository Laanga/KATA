'use client';

import { useState, useEffect, useCallback } from 'react';
import { Navbar } from "@/components/layout/Navbar";
import { SearchInput } from "@/components/search/SearchInput";
import { KataCard } from "@/components/media/KataCard";
import { useMediaStore } from "@/lib/store";
import { MediaType } from "@/types/media";
import { EmptyState } from "@/components/ui/EmptyState";
import { Search } from "lucide-react";
import { MediaGridSkeleton } from "@/components/ui/Skeleton";
import { AnimatedGrid } from "@/components/AnimatedGrid";
import { FadeIn } from "@/components/FadeIn";
import { AddItemModal } from "@/components/media/AddItemModal";
import { ShortcutsModal } from "@/components/ShortcutsModal";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useRouter } from "next/navigation";

export default function SearchPage() {
  const router = useRouter();
  const items = useMediaStore((state) => state.items);
  const [filteredItems, setFilteredItems] = useState(items);
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  const debounce = <T extends (...args: unknown[]) => void>(
    func: T,
    wait: number
  ) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const performSearch = useCallback((query: string, type: MediaType | 'ALL') => {
    setIsSearching(true);
    
    setTimeout(() => {
      let results = [...items];

      if (type !== 'ALL') {
        results = results.filter((item) => item.type === type);
      }

      if (query && query.length >= 2) {
        const lowerQuery = query.toLowerCase();
        results = results.filter((item) => {
          return (
            item.title.toLowerCase().includes(lowerQuery) ||
            item.author?.toLowerCase().includes(lowerQuery) ||
            item.platform?.toLowerCase().includes(lowerQuery)
          );
        });
      }

      setFilteredItems(results);
      setIsSearching(false);
    }, 300);
  }, [items]);

  const debouncedSearch = useCallback(
    debounce((query: string, type: MediaType | 'ALL') => {
      setDebouncedQuery(query);
      performSearch(query, type);
    }, 300),
    [performSearch]
  );

  const handleSearch = (query: string, type: MediaType | 'ALL') => {
    debouncedSearch(query, type);
  };

  useEffect(() => {
    setFilteredItems(items);
  }, [items]);

  useKeyboardShortcuts([
    {
      key: 'n',
      ctrl: true,
      callback: () => setIsAddModalOpen(true),
      description: 'Add new item',
    },
    {
      key: 'h',
      callback: () => router.push('/'),
      description: 'Go to home',
    },
    {
      key: 'l',
      callback: () => router.push('/library'),
      description: 'Go to library',
    },
    {
      key: 'p',
      callback: () => router.push('/profile'),
      description: 'Go to profile',
    },
    {
      key: '?',
      callback: () => setIsShortcutsModalOpen(true),
      description: 'Show shortcuts',
    },
  ]);

  return (
    <>
      <div className="min-h-screen pb-20">
        <Navbar />

        <main className="container mx-auto px-4 pt-32 flex flex-col items-center">
          <FadeIn direction="up" delay={0.1} className="w-full">
            <div className="w-full text-center mb-12">
              <h1 className="text-4xl font-bold tracking-tight mb-4">What's next?</h1>
              <SearchInput onSearch={handleSearch} />
            </div>
          </FadeIn>

          <div className="w-full mt-12">
            <FadeIn direction="up" delay={0.2}>
              <h2 className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-6">
                {debouncedQuery ? `Results for "${debouncedQuery}"` : 'All Items'}
                <span className="ml-2 text-[var(--accent-primary)]">({filteredItems.length})</span>
              </h2>
            </FadeIn>

            {isSearching ? (
              <MediaGridSkeleton count={6} />
            ) : filteredItems.length === 0 ? (
              <FadeIn delay={0.3}>
                <EmptyState
                  icon={<Search />}
                  title="No results found"
                  description="Try adjusting your search or filters."
                />
              </FadeIn>
            ) : (
              <AnimatedGrid staggerDelay={0.05}>
                {filteredItems.map((item) => (
                  <KataCard key={item.id} item={item} />
                ))}
              </AnimatedGrid>
            )}
          </div>
        </main>
      </div>

      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
    </>
  );
}
