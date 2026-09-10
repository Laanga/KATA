'use client';

import { useMediaStore } from '@/lib/store';
import { Folder, Plus } from 'lucide-react';
import CreateCollectionModal from './CreateCollectionModal';
import { useState } from 'react';

interface CollectionsFilterProps {
  selectedCollection: string | 'ALL';
  onCollectionSelect: (collectionId: string | 'ALL') => void;
}

export default function CollectionsFilter({
  selectedCollection,
  onCollectionSelect,
}: CollectionsFilterProps) {
  const collections = useMediaStore((state) => state.collections);
  const getItemsByCollection = useMediaStore((state) => state.getItemsByCollection);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <>
      <div className="lg:hidden sticky top-0 md:top-16 z-10 bg-[var(--bg-primary)]/70 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => onCollectionSelect('ALL')}
              className={`flex flex-shrink-0 items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm border border-white/10 transition-all ${
                selectedCollection === 'ALL'
                  ? 'liquid-glass-active text-[var(--accent-primary)] font-medium'
                  : 'liquid-glass-soft text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              <Folder className="w-4 h-4" />
              <span>Todas</span>
              <span className="text-xs opacity-60">
                {useMediaStore.getState().getStats().total}
              </span>
            </button>

            {collections.map((collection) => {
              const itemCount = getItemsByCollection(collection.id).length;
              const isActive = selectedCollection === collection.id;
              const color = collection.color || 'var(--text-secondary)';

              return (
                <button
                  key={collection.id}
                  onClick={() => onCollectionSelect(collection.id)}
                  className={`liquid-glass-soft flex flex-shrink-0 items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm transition-all ${
                    isActive
                      ? 'text-white font-medium'
                      : 'text-[var(--text-secondary)] hover:text-white'
                  }`}
                  style={{
                    border: `1px solid color-mix(in srgb, ${color} ${isActive ? '60%' : '25%'}, transparent)`,
                    boxShadow: isActive
                      ? `0 0 14px color-mix(in srgb, ${color} 25%, transparent)`
                      : undefined,
                  }}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="truncate max-w-[120px]">{collection.name}</span>
                  <span className="text-xs opacity-60">{itemCount}</span>
                </button>
              );
            })}

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="liquid-glass-soft flex items-center justify-center w-9 h-9 rounded-full border border-white/10 text-[var(--accent-primary)] hover:border-[var(--accent-primary)]/50 transition-all flex-shrink-0"
              aria-label="Crear colección"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {isCreateModalOpen && (
        <CreateCollectionModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </>
  );
}
