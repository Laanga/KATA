'use client';
import { Chip } from '@/components/ui/Choice';
import { TextArea } from '@/components/ui/Field';

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
import { MediaCover as Image } from './MediaCover';

interface EditItemModalProps {
  item: MediaItem;
  isOpen: boolean;
  onClose: () => void;
}

export function EditItemModal({ item, isOpen, onClose }: EditItemModalProps) {
  const [isSaving, setIsSaving] = useState(false);
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
    } catch {
      toast.error('Error al actualizar colección');
    } finally {
      setIsUpdatingCollections(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      await updateItem(item.id, {
        status: formData.status,
        rating: formData.rating,
        review: formData.review,
      });
      toast.success(`"${item.title}" actualizado`);
      onClose();
    } catch {
      toast.error('No se pudo guardar. Tus cambios siguen aquí para reintentar.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isSaving && !isUpdatingCollections) onClose();
      }}
      title="Editar"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Item Preview - Read Only */}
        <div className="kata-panel kata-panel--subtle p-4">
          <div className="flex items-start gap-4">
            <div className="relative h-28 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-white/5 border border-white/10">
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
                <h3 className="kata-title-dialog line-clamp-2 flex-1">{item.title}</h3>
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
                <p className="text-xs text-[var(--text-tertiary)]">{item.releaseYear}</p>
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
            <label className="kata-label">Estado</label>
            <Select
              aria-label="Estado"
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value as MediaStatus })}
              options={statusOptions}
            />
          </div>

          {/* Rating */}
          <div>
            <label className="kata-label">Valoración</label>
            <RatingInput
              value={formData.rating}
              onChange={(value) => setFormData({ ...formData, rating: value })}
            />
          </div>

          {/* Collections */}
          {collections.length > 0 && (
            <div>
              <label className="kata-label">
                <span className="flex items-center gap-2">
                  <FolderPlus size={16} />
                  Colecciones
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {collections.map((collection) => {
                  const isSelected = isInCollection(collection.id);

                  return (
                    <Chip
                      selected={isSelected}
                      key={collection.id}
                      type="button"
                      onClick={() => handleToggleCollection(collection.id)}
                      disabled={isUpdatingCollections}
                      className="shrink-0"
                    >
                      {/* Icon o emoji */}
                      {collection.icon && <span className="text-base">{collection.icon}</span>}

                      {/* Nombre */}
                      <span>{collection.name}</span>

                      {/* Check cuando está seleccionado */}
                      {isSelected && <Check size={14} className="ml-0.5" />}
                    </Chip>
                  );
                })}
              </div>
            </div>
          )}

          {/* Review */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="kata-label">Notas personales</label>
              <span className="text-xs text-[var(--text-tertiary)]">
                {formData.review.length}/500
              </span>
            </div>
            <TextArea
              aria-label="Reseña / Notas"
              value={formData.review}
              onChange={(e) => setFormData({ ...formData, review: e.target.value })}
              placeholder="¿Qué te pareció? (opcional)"
              className="w-full"
              maxLength={500}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="kata-action-row">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSaving || isUpdatingCollections}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            disabled={isUpdatingCollections}
          >
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
