'use client';

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

export default function CollectionsSidebar({ selectedCollection, onCollectionSelect }: CollectionsSidebarProps) {
  const collections = useMediaStore((state) => state.collections);
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
      className={`liquid-glass-soft relative rounded-2xl border border-white/10 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-full lg:w-64'
      }`}
    >
      <button
        onClick={() => {
          setIsCollapsed(!isCollapsed);
          handleCloseMenu();
        }}
        className="liquid-glass-soft absolute -top-3 -right-3 z-20 p-1.5 rounded-full border border-white/10 text-[var(--accent-primary)] hover:border-[var(--accent-primary)]/50 transition-colors"
        title={isCollapsed ? 'Expandir' : 'Colapsar'}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className={`p-4 transition-all duration-300 ${isCollapsed ? 'opacity-0 pointer-events-none' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Colecciones
          </h2>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="p-1.5 rounded-full hover:bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] transition-colors"
            title="Crear colección"
            aria-label="Crear colección"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1">
          <button
            onClick={() => onCollectionSelect('ALL')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
              selectedCollection === 'ALL'
                ? 'liquid-glass-active text-[var(--accent-primary)]'
                : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Folder className="w-5 h-5" />
              <span className="text-sm">Todas las colecciones</span>
            </div>
          </button>

          {collections.map((collection) => {
            const itemCount = getItemsByCollection(collection.id).length;
            const isActive = selectedCollection === collection.id;

            return (
              <div key={collection.id} className="relative group">
                <button
                  onClick={() => onCollectionSelect(collection.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'liquid-glass-active text-[var(--accent-primary)]'
                      : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Folder
                      className="w-5 h-5 flex-shrink-0"
                      style={{ color: collection.color || 'var(--text-secondary)' }}
                    />
                    <span className="text-sm truncate">{collection.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--text-tertiary)] group-hover:opacity-0 transition-opacity">
                      {itemCount}
                    </span>
                  </div>
                </button>

                <button
                  ref={(el) => {
                    menuButtonRefs.current[collection.id] = el;
                  }}
                  onClick={(e) => handleOpenMenu(collection, e)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-opacity"
                  title="Más opciones"
                  aria-label="Más opciones"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
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
