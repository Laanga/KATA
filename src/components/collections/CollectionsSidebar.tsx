'use client';
import { Chip } from '@/components/ui/Choice';
import { IconButton } from '@/components/ui/Button';

import { useMediaStore } from '@/lib/store';
import { Plus, Folder, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import { useState, useRef } from 'react';
import CreateCollectionModal from './CreateCollectionModal';
import { CollectionActionMenu } from './CollectionActionMenu';
import { EditCollectionNameModal } from './EditCollectionNameModal';
import { toast } from 'react-hot-toast';
import type { Collection } from '@/types/collections';

interface CollectionsSidebarProps {
  selectedCollection: string | 'ALL';
  onCollectionSelect: (collectionId: string | 'ALL') => void;
}

export default function CollectionsSidebar({
  selectedCollection,
  onCollectionSelect,
}: CollectionsSidebarProps) {
  const collections = useMediaStore((state) => state.collections);
  const totalItems = useMediaStore((state) => state.items.length);
  const deleteCollection = useMediaStore((state) => state.deleteCollection);
  const updateCollection = useMediaStore((state) => state.updateCollection);
  const getItemsByCollection = useMediaStore((state) => state.getItemsByCollection);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [menuCollection, setMenuCollection] = useState<Collection | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | undefined>();
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);

  const menuButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const handleOpenMenu = (collection: Collection, e: React.MouseEvent) => {
    e.stopPropagation();
    const button = menuButtonRefs.current[collection.id];
    if (button) {
      const rect = button.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setMenuCollection(collection);
  };

  const handleCloseMenu = () => {
    setMenuCollection(null);
    setMenuPosition(undefined);
  };

  const handleDeleteCollection = async () => {
    if (!menuCollection) return;

    try {
      await deleteCollection(menuCollection.id);
      toast.success(`"${menuCollection.name}" eliminada`);
      if (selectedCollection === menuCollection.id) {
        onCollectionSelect('ALL');
      }
    } catch {
      toast.error('Error al eliminar colección');
    }
    handleCloseMenu();
  };

  const handleChangeColor = async (color: string) => {
    if (!menuCollection) return;

    try {
      await updateCollection(menuCollection.id, { color });
    } catch {
      toast.error('Error al cambiar color');
    }
  };

  const handleUpdateName = async (id: string, name: string) => {
    await updateCollection(id, { name });
  };

  return (
    <div
      className={`kata-panel kata-panel--subtle p-0 relative overflow-hidden transition-[width] duration-300 ease-out ${
        isCollapsed ? 'w-16' : 'w-full lg:w-64'
      }`}
    >
      {isCollapsed ? (
        /* Rail contraído: cada colección es un punto de su color */
        <div className="flex flex-col items-center gap-1.5 p-2">
          <IconButton
            onClick={() => {
              setIsCollapsed(false);
              handleCloseMenu();
            }}

            title="Expandir colecciones"
            label="Expandir colecciones"
          >
            <ChevronRight className="w-4 h-4" />
          </IconButton>

          <div className="h-px w-6 bg-white/10" />

          <Chip
            selected={selectedCollection === 'ALL'}
            onClick={() => onCollectionSelect('ALL')}
            className="shrink-0 w-11 px-0"
            title="Todas las colecciones"
            aria-label="Todas las colecciones"
          >
            <Folder className="w-4 h-4" />
          </Chip>

          {collections.map((collection) => {
            const isActive = selectedCollection === collection.id;
            return (
              <Chip
                selected={isActive}
                key={collection.id}
                onClick={() => onCollectionSelect(collection.id)}
                className="shrink-0 w-11 px-0"
                title={collection.name}
                aria-label={collection.name}
              >
                <span
                  className={`rounded-full transition-all ${isActive ? 'h-3 w-3' : 'h-2.5 w-2.5'}`}
                  style={{ backgroundColor: collection.color || 'var(--text-tertiary)' }}
                />
              </Chip>
            );
          })}

          <IconButton
            onClick={() => setIsCreateModalOpen(true)}

            title="Crear colección"
            label="Crear colección"
          >
            <Plus className="w-4 h-4" />
          </IconButton>
        </div>
      ) : (
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="kata-section-label text-[var(--text-secondary)]">Colecciones</h2>
            <div className="flex items-center gap-1">
              <IconButton
                onClick={() => setIsCreateModalOpen(true)}

                title="Crear colección"
                label="Crear colección"
              >
                <Plus className="w-4 h-4" />
              </IconButton>
              <IconButton
                onClick={() => {
                  setIsCollapsed(true);
                  handleCloseMenu();
                }}

                title="Contraer colecciones"
                label="Contraer colecciones"
              >
                <ChevronLeft className="w-4 h-4" />
              </IconButton>
            </div>
          </div>

          <div className="space-y-1">
            <Chip
              selected={selectedCollection === 'ALL'}
              onClick={() => onCollectionSelect('ALL')}
              className="w-full justify-between min-w-0 pr-12"
            >
              <div className="flex items-center gap-3">
                <Folder className="w-4 h-4" />
                <span className="text-sm">Todas</span>
              </div>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-white/5 text-[var(--text-tertiary)]">
                {totalItems}
              </span>
            </Chip>

            {collections.map((collection) => {
              const itemCount = getItemsByCollection(collection.id).length;
              const isActive = selectedCollection === collection.id;

              return (
                <div key={collection.id} className="relative group">
                  <Chip
                    selected={isActive}
                    onClick={() => onCollectionSelect(collection.id)}
                    className="w-full justify-between min-w-0 pr-12"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: collection.color || 'var(--text-tertiary)' }}
                      />
                      <span className="text-sm truncate">{collection.name}</span>
                    </div>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-white/5 text-[var(--text-tertiary)] mr-1">
                      {itemCount}
                    </span>
                  </Chip>

                  <IconButton
                    ref={(el) => {
                      menuButtonRefs.current[collection.id] = el;
                    }}
                    onClick={(e) => handleOpenMenu(collection, e)}
                    className="absolute right-0 top-1/2 -translate-y-1/2"
                    title="Más opciones"
                    label="Más opciones"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </IconButton>
                </div>
              );
            })}
          </div>

          {collections.length === 0 && (
            <div className="text-center py-8 text-[var(--text-tertiary)]">
              <Folder className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No tienes colecciones</p>
              <p className="text-xs mt-1 opacity-70">Crea una para organizar tus items</p>
            </div>
          )}
        </div>
      )}

      {/* Modales */}
      {isCreateModalOpen && (
        <CreateCollectionModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {menuCollection && (
        <CollectionActionMenu
          collection={menuCollection}
          isOpen={true}
          onClose={handleCloseMenu}
          onEditName={() => {
            setEditingCollection(menuCollection);
            handleCloseMenu();
          }}
          onChangeColor={handleChangeColor}
          onDelete={handleDeleteCollection}
          position={menuPosition}
        />
      )}

      {editingCollection && (
        <EditCollectionNameModal
          collection={editingCollection}
          isOpen={true}
          onClose={() => setEditingCollection(null)}
          onUpdate={handleUpdateName}
        />
      )}
    </div>
  );
}
