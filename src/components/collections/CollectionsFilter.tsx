'use client';
import { IconButton } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Choice';

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
            <Chip
              selected={selectedCollection === 'ALL'}
              onClick={() => onCollectionSelect('ALL')}
              className="shrink-0"
            >
              <Folder className="w-4 h-4" />
              <span>Todas</span>
              <span className="text-xs opacity-60">
                {useMediaStore.getState().getStats().total}
              </span>
            </Chip>

            {collections.map((collection) => {
              const itemCount = getItemsByCollection(collection.id).length;
              const isActive = selectedCollection === collection.id;
              const color = collection.color || 'var(--text-secondary)';

              return (
                <Chip
                  selected={isActive}
                  key={collection.id}
                  onClick={() => onCollectionSelect(collection.id)}
                  className="shrink-0"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="truncate max-w-[120px]">{collection.name}</span>
                  <span className="text-xs opacity-60">{itemCount}</span>
                </Chip>
              );
            })}

            <IconButton
              onClick={() => setIsCreateModalOpen(true)}

              label="Crear colección"
            >
              <Plus className="w-4 h-4" />
            </IconButton>
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
