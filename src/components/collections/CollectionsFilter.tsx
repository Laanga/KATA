'use client';

import { useMediaStore } from '@/lib/store';
import { Folder, Plus } from 'lucide-react';
import CreateCollectionModal from './CreateCollectionModal';
import { useState } from 'react';

interface CollectionsFilterProps {
  selectedCollection: string | 'ALL';
  onCollectionSelect: (collectionId: string | 'ALL') => void;
}

export default function CollectionsFilter({ selectedCollection, onCollectionSelect }: CollectionsFilterProps) {
  const collections = useMediaStore((state) => state.collections);
  const getItemsByCollection = useMediaStore((state) => state.getItemsByCollection);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <>
      <div className="lg:hidden sticky top-14 sm:top-16 z-10 bg-[var(--bg-primary)]/95 backdrop-blur-sm border-b border-white/5">
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => onCollectionSelect('ALL')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedCollection === 'ALL'
                  ? 'bg-[var(--accent-primary)] text-black font-semibold'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              <Folder className="w-4 h-4" />
              <span>Todas</span>
              <span className="text-xs opacity-70">
                {useMediaStore.getState().getStats().total}
              </span>
            </button>

            {collections.map((collection) => {
              const itemCount = getItemsByCollection(collection.id).length;

              return (
                <button
                  key={collection.id}
                  onClick={() => onCollectionSelect(collection.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                    selectedCollection === collection.id
                      ? 'bg-[var(--accent-primary)] text-black font-semibold'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-white'
                  }`}
                  style={{
                    border: selectedCollection === collection.id 
                      ? '2px solid transparent' 
                      : `2px solid ${collection.color || 'var(--text-secondary)'}40`
                  }}
                >
                  <Folder 
                    className="w-4 h-4" 
                    style={{ 
                      color: selectedCollection === collection.id 
                        ? 'black' 
                        : collection.color || 'var(--text-secondary)' 
                    }} 
                  />
                  <span className="truncate max-w-[120px]">{collection.name}</span>
                  <span className="text-xs opacity-70">{itemCount}</span>
                </button>
              );
            })}

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--bg-secondary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-black transition-all flex-shrink-0"
              aria-label="Crear colección"
            >
              <Plus className="w-5 h-5" />
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
