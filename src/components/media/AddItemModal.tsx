'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { RatingInput } from './RatingInput';
import { MediaType, MediaStatus } from '@/types/media';
import { VALID_STATUSES, STATUS_LABELS, TYPE_LABELS, TYPE_ICONS } from '@/lib/utils/constants';
import { useMediaStore } from '@/lib/store';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledType?: MediaType;
  initialData?: Partial<{
    title: string;
    coverUrl: string;
    releaseYear: number;
    author: string;
    platform: string;
    genres: string[];
  }>;
}

export function AddItemModal({ isOpen, onClose, prefilledType, initialData }: AddItemModalProps) {
  const addItem = useMediaStore((state) => state.addItem);

  const [formData, setFormData] = useState({
    // Read-only data from API
    title: initialData?.title || '',
    type: prefilledType || ('BOOK' as MediaType),
    coverUrl: initialData?.coverUrl || '',
    author: initialData?.author || '',
    platform: initialData?.platform || '',
    releaseYear: initialData?.releaseYear || undefined as number | undefined,
    genres: initialData?.genres || [],
    
    // Editable user data
    status: 'WANT_TO_READ' as MediaStatus,
    rating: null as number | null,
    review: '',
  });

  // Update status when type changes
  useEffect(() => {
    if (prefilledType) {
      setFormData(prev => ({
        ...prev,
        type: prefilledType,
        status: VALID_STATUSES[prefilledType][0],
      }));
    }
  }, [prefilledType]);

  const statusOptions = VALID_STATUSES[formData.type].map((status) => ({
    value: status,
    label: STATUS_LABELS[status],
  }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('El título es obligatorio');
      return;
    }

    const newItem = {
      id: crypto.randomUUID(),
      title: formData.title.trim(),
      type: formData.type,
      coverUrl: formData.coverUrl || 'https://via.placeholder.com/300x450?text=Sin+Portada',
      status: formData.status,
      rating: formData.rating,
      review: formData.review || undefined,
      author: formData.author || undefined,
      platform: formData.platform || undefined,
      releaseYear: formData.releaseYear,
      genres: formData.genres,
      createdAt: new Date().toISOString(),
    };

    addItem(newItem);
    toast.success(`"${formData.title}" añadido a tu kata`);
    onClose();

    // Reset editable fields only
    setFormData(prev => ({
      ...prev,
      status: VALID_STATUSES[prev.type][0],
      rating: null,
      review: '',
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Añadir a Tu Biblioteca" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Item Preview */}
        <div className="rounded-lg border border-white/10 bg-[var(--bg-tertiary)] p-6">
          <div className="flex items-start gap-4">
            <div className="relative h-32 w-24 flex-shrink-0 rounded-lg overflow-hidden bg-[var(--bg-secondary)] border border-white/5">
              {formData.coverUrl ? (
                <Image
                  src={formData.coverUrl}
                  alt={formData.title}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[var(--text-tertiary)] text-xs">
                  Sin Portada
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-2">
                <h3 className="text-lg font-bold text-white line-clamp-2 flex-1">
                  {formData.title || 'Sin título'}
                </h3>
                <span className="flex-shrink-0 text-xs px-2 py-1 rounded-full bg-white/5 text-[var(--text-secondary)]">
                  {TYPE_LABELS[formData.type]}
                </span>
              </div>
              
              {(formData.author || formData.platform) && (
                <p className="text-sm text-[var(--text-secondary)] mb-1">
                  {formData.author || formData.platform}
                </p>
              )}
              
              {formData.releaseYear && (
                <p className="text-xs text-[var(--text-tertiary)]">
                  {formData.releaseYear}
                </p>
              )}
              
              {formData.genres && formData.genres.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.genres.slice(0, 3).map((genre, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-0.5 rounded bg-white/5 text-[var(--text-tertiary)]"
                    >
                      {genre}
                    </span>
                  ))}
                  {formData.genres.length > 3 && (
                    <span className="text-xs text-[var(--text-tertiary)]">
                      +{formData.genres.length - 3} más
                    </span>
                  )}
                </div>
              )}
            </div>
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
              Puntuación
            </label>
            <RatingInput
              value={formData.rating}
              onChange={(value) => setFormData({ ...formData, rating: value })}
            />
            <p className="mt-1 text-xs text-[var(--text-tertiary)]">
              Opcional - Puntúa de 0 a 5 estrellas
            </p>
          </div>

          {/* Review */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
              Reseña / Notas
            </label>
            <textarea
              value={formData.review}
              onChange={(e) => setFormData({ ...formData, review: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-[var(--bg-tertiary)] p-3 text-sm text-white placeholder-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors"
              rows={4}
              placeholder="¿Qué te pareció? (opcional)"
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
            Añadir a la Biblioteca
          </Button>
        </div>
      </form>
    </Modal>
  );
}
