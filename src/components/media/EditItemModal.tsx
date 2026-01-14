'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { RatingInput } from './RatingInput';
import { MediaItem, MediaStatus } from '@/types/media';
import { VALID_STATUSES, STATUS_LABELS, TYPE_LABELS } from '@/lib/utils/constants';
import { useMediaStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { Lock } from 'lucide-react';
import Image from 'next/image';

interface EditItemModalProps {
  item: MediaItem;
  isOpen: boolean;
  onClose: () => void;
}

export function EditItemModal({ item, isOpen, onClose }: EditItemModalProps) {
  const updateItem = useMediaStore((state) => state.updateItem);

  const [formData, setFormData] = useState({
    status: item.status,
    rating: item.rating,
    review: item.review || '',
  });

  const statusOptions = VALID_STATUSES[item.type].map((status) => ({
    value: status,
    label: STATUS_LABELS[status],
  }));

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
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Item" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Item Preview - Read Only */}
        <div className="rounded-lg border border-white/10 bg-[var(--bg-tertiary)] p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="relative h-32 w-24 flex-shrink-0 rounded-lg overflow-hidden bg-[var(--bg-secondary)] border border-white/5">
              <Image
                src={item.coverUrl}
                alt={item.title}
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-2">
                <h3 className="text-lg font-bold text-white line-clamp-2 flex-1">
                  {item.title}
                </h3>
                <span className="flex-shrink-0 text-xs px-2 py-1 rounded-full bg-white/5 text-[var(--text-secondary)]">
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
                  {item.genres.length > 3 && (
                    <span className="text-xs text-[var(--text-tertiary)]">
                      +{item.genres.length - 3} más
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] pt-3 border-t border-white/5">
            <Lock size={12} />
            <span>Información de la API (solo lectura)</span>
          </div>
        </div>

        {/* Editable Fields */}
        <div className="space-y-6">
          <div className="border-b border-white/10 pb-2">
            <h4 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
              Tu Información
            </h4>
          </div>

          {/* Status */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
              Estado *
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
            <p className="mt-1 text-xs text-[var(--text-tertiary)]">
              Opcional - Valora de 0 a 5
            </p>
          </div>

          {/* Review */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                Reseña / Notas
              </label>
              <span className="text-xs text-[var(--text-tertiary)]">
                {formData.review.length}/500
              </span>
            </div>
            <textarea
              value={formData.review}
              onChange={(e) => setFormData({ ...formData, review: e.target.value })}
              placeholder="¿Qué te pareció? (opcional)"
              className="min-h-[120px] w-full resize-none rounded-lg border border-white/10 bg-[var(--bg-tertiary)] p-3 text-sm text-white placeholder-[var(--text-tertiary)] transition-colors focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              maxLength={500}
            />
            <p className="mt-1 text-xs text-[var(--text-tertiary)]">
              Opcional - Tus pensamientos y notas personales
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Guardar Cambios
          </Button>
        </div>
      </form>
    </Modal>
  );
}
