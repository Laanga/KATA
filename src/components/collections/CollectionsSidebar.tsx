'use client';

import { useMediaStore } from '@/lib/store';
import { Plus, Folder, Menu, MoreVertical } from 'lucide-react';
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
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [actionMenuPosition, setActionMenuPosition] = useState<{ top: number; right: number } | undefined>();
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const menuButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const handleDeleteCollection = async (collectionId: string) => {
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) return;

    try {
      await deleteCollection(collectionId);
      toast.success(`"${collection.name}" eliminada`);
      setActionMenuOpen(null);
    } catch {
      toast.error('Error al eliminar colección');
    }
  };

  const handleEditName = (collection: Collection) => {
    setEditingCollection(collection);
    setActionMenuOpen(null);
  };

  const handleUpdateName = async (id: string, name: string) => {
    try {
      await updateCollection(id, { name });
    } catch (error) {
      throw error;
    }
  };

  const handleChangeColor = async (collectionId: string, color: string) => {
    try {
      await updateCollection(collectionId, { color });
      toast.success('Color actualizado');
    } catch {
      toast.error('Error al actualizar color');
    }
  };

  const handleMoreClick = (e: React.MouseEvent, collectionId: string) => {
    e.stopPropagation();
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    setActionMenuPosition({
      top: rect.bottom + window.scrollY + 4,
      right: window.innerWidth - rect.right + window.scrollX,
    });
    setActionMenuOpen(actionMenuOpen === collectionId ? null : collectionId);
  };

  return (
    <div className={`relative bg-card/50 backdrop-blur-sm transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-full lg:w-64'
    }`}>
      <button
        onClick={() => {
          setIsCollapsed(!isCollapsed);
          setActionMenuOpen(null);
        }}
        className="absolute -top-4 left-3 z-20 p-1.5 rounded-lg bg-accent/20 hover:bg-accent/30 text-accent-foreground transition-colors"
        title={isCollapsed ? 'Expandir' : 'Colapsar'}
      >
        <Menu className="w-4 h-4" />
      </button>

      {!isCollapsed && (
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="absolute top-4 right-3 z-10 p-2 rounded-lg hover:bg-accent/20 text-accent-foreground transition-colors"
          title="Crear colección"
        >
          <Plus className="w-5 h-5" />
        </button>
      )}

      <div className={`p-4 transition-all duration-300 ${isCollapsed ? 'opacity-0 pointer-events-none' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Colecciones</h2>
        </div>

        <div className="space-y-1">
          <button
            onClick={() => onCollectionSelect('ALL')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
              selectedCollection === 'ALL'
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-accent/10 text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-3">
              <Folder className="w-5 h-5" />
              <span>General</span>
            </div>
          </button>

          {collections.map((collection) => {
            const itemCount = getItemsByCollection(collection.id).length;

            return (
              <div key={collection.id} className="relative group">
                <button
                  onClick={() => onCollectionSelect(collection.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    selectedCollection === collection.id
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent/10 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Folder
                      className="w-5 h-5"
                      style={{ color: collection.color || 'var(--text-secondary)' }}
                    />
                    <span className="truncate">{collection.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{itemCount}</span>
                  </div>
                </button>

                <button
                  ref={(el) => {
                    menuButtonRefs.current[collection.id] = el;
                  }}
                  onClick={(e) => handleMoreClick(e, collection.id)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-opacity"
                  title="Más opciones"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            );
          })}

          {actionMenuOpen && (
            <CollectionActionMenu
              collection={collections.find(c => c.id === actionMenuOpen)!}
              isOpen={actionMenuOpen !== null}
              onClose={() => setActionMenuOpen(null)}
              onEditName={() => handleEditName(collections.find(c => c.id === actionMenuOpen)!)}
              onChangeColor={(color) => handleChangeColor(actionMenuOpen!, color)}
              onDelete={() => handleDeleteCollection(actionMenuOpen!)}
              position={actionMenuPosition}
            />
          )}
        </div>

        {collections.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Folder className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tienes colecciones</p>
            <p className="text-xs mt-1">Crea una para organizar tus items</p>
          </div>
        )}
      </div>

      {isCreateModalOpen && (
        <CreateCollectionModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}

      {editingCollection && (
        <EditCollectionNameModal
          collection={editingCollection}
          isOpen={editingCollection !== null}
          onClose={() => setEditingCollection(null)}
          onUpdate={handleUpdateName}
        />
      )}
    </div>
  );
}
