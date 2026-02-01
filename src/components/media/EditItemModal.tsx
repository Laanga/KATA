'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { RatingInput } from './RatingInput';
import { MediaItem, MediaStatus } from '@/types/media';
import { VALID_STATUSES, STATUS_LABELS, TYPE_LABELS } from '@/lib/utils/constants';
import { useMediaStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { FolderPlus, Check } from 'lucide-react';
import Image from 'next/image';

interface EditItemModalProps {
  item: MediaItem;
  isOpen: boolean;
  onClose: () => void;
}

export function EditItemModal({ item, isOpen, onClose }: EditItemModalProps) {
  const updateItem = useMediaStore((state) => state.updateItem);
  const collections = useMediaStore((state) => state.collections);
  const collectionItemIds = useMediaStore((state) => state.collectionItemIds);
  const addItemToCollection = useMediaStore((state) => state.addItemToCollection);
  const removeItemFromCollection = useMediaStore((state) => state.removeItemFromCollection);

  const [formData, setFormData] = useState({
    status: item.status,
    rating: item.rating,
    review: item.review || '',
  });

  // Track which collections this item belongs to
  const [itemCollections, setItemCollections] = useState<string[]>([]);
  const [isUpdatingCollections, setIsUpdatingCollections] = useState(false);

  // Initialize item collections when modal opens
  useEffect(() => {
    if (isOpen) {
      const belongsTo = collections
        .filter((c) => collectionItemIds[c.id]?.includes(item.id))
        .map((c) => c.id);
      setItemCollections(belongsTo);
    }
  }, [isOpen, collections, collectionItemIds, item.id]);

  const statusOptions = VALID_STATUSES[item.type].map((status) => ({
    value: status,
    label: STATUS_LABELS[status],
  }));

  const isInCollection = (collectionId: string) => {
    return itemCollections.includes(collectionId);
  };

  const handleToggleCollection = async (collectionId: string) => {
    setIsUpdatingCollections(true);
    try {
      if (isInCollection(collectionId)) {
        await removeItemFromCollection(item.id, collectionId);
        setItemCollections((prev) => prev.filter((id) => id !== collectionId));
        toast.success('Eliminado de la colección');
      } else {
        await addItemToCollection(item.id, collectionId);
        setItemCollections((prev) => [...prev, collectionId]);
        toast.success('Añadido a la colección');
      }
    } catch (error) {
      toast.error('Error al actualizar colección');
    } finally {
      setIsUpdatingCollections(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateItem(item.id, {
      status: formData.status,
      rating: formData.rating,
      review: formData.review || undefined,
    });

    toast.success(`"${item.title}" actualizado`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Item Preview - Read Only */}
        <div className="rounded-xl border border-white/10 bg-[var(--bg-tertiary)] p-4">
          <div className="flex items-start gap-4">
            <div className="relative h-28 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-[var(--bg-secondary)] border border-white/5">
              <Image
                src={item.coverUrl}
                alt={item.title}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-1">
                <h3 className="text-base font-bold text-white line-clamp-2 flex-1">
                  {item.title}
                </h3>
                <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full bg-white/5 text-[var(--text-secondary)]">
                  {TYPE_LABELS[item.type]}
                </span>
              </div>
              
              {(item.author || item.platform) && (
                <p className="text-sm text-[var(--text-secondary)] mb-1">
                  {item.author || item.platform}
                </p>
              )}
              
              {item.releaseYear && (
                <p className="text-xs text-[var(--text-tertiary)]">
                  {item.releaseYear}
                </p>
              )}
              
              {item.genres && item.genres.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.genres.slice(0, 3).map((genre, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-0.5 rounded bg-white/5 text-[var(--text-tertiary)]"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Editable Fields */}
        <div className="space-y-5">
          {/* Status */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
              Estado
            </label>
            <Select
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value as MediaStatus })}
              options={statusOptions}
            />
          </div>

          {/* Rating */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
              Valoración
            </label>
            <RatingInput
              value={formData.rating}
              onChange={(value) => setFormData({ ...formData, rating: value })}
            />
          </div>

          {/* Collections */}
          {collections.length > 0 && (
            <div>
              <label className="mb-3 block text-sm font-medium text-[var(--text-secondary)]">
                <span className="flex items-center gap-2">
                  <FolderPlus size={16} />
                  Colecciones
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {collections.map((collection) => {
                  const isSelected = isInCollection(collection.id);
                  const color = collection.color || '#6366F1';
                  
                  return (
                    <button
                      key={collection.id}
                      type="button"
                      onClick={() => handleToggleCollection(collection.id)}
                      disabled={isUpdatingCollections}
                      className={`
                        group relative flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium
                        transition-all duration-200 ease-out
                        ${isUpdatingCollections ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                      style={{
                        backgroundColor: isSelected ? color : 'transparent',
                        borderWidth: '2px',
                        borderStyle: 'solid',
                        borderColor: isSelected ? color : 'rgba(255,255,255,0.1)',
                        color: isSelected ? '#000' : 'var(--text-secondary)',
                        boxShadow: isSelected ? `0 0 20px ${color}40` : 'none',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = color;
                          e.currentTarget.style.backgroundColor = `${color}20`;
                          e.currentTarget.style.color = color;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }
                      }}
                    >
                      {/* Icon o emoji */}
                      {collection.icon && (
                        <span className="text-base">{collection.icon}</span>
                      )}
                      
                      {/* Nombre */}
                      <span>{collection.name}</span>
                      
                      {/* Check cuando está seleccionado */}
                      {isSelected && (
                        <Check size={14} className="ml-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Review */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                Notas personales
              </label>
              <span className="text-xs text-[var(--text-tertiary)]">
                {formData.review.length}/500
              </span>
            </div>
            <textarea
              value={formData.review}
              onChange={(e) => setFormData({ ...formData, review: e.target.value })}
              placeholder="¿Qué te pareció? (opcional)"
              className="min-h-[100px] w-full resize-none rounded-xl border border-white/10 bg-[var(--bg-tertiary)] p-3 text-sm text-white placeholder-[var(--text-tertiary)] transition-colors focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              maxLength={500}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
