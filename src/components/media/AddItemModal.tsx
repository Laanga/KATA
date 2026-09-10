'use client';
import { TextArea } from '@/components/ui/Field';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { RatingInput } from './RatingInput';
import { MediaType, MediaStatus, MediaItem, MediaProvider } from '@/types/media';
import { VALID_STATUSES, STATUS_LABELS, TYPE_LABELS } from '@/lib/utils/constants';
import { useMediaStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { Lock } from 'lucide-react';
import { MediaCover as Image } from './MediaCover';
import { sameMedia } from '@/lib/utils/mediaIdentity';
import { isValidTitle, isValidRating, isValidReview } from '@/lib/utils/validation';

interface AddItemModalProps {
  isOpen: boolean;
  gentle?: boolean;
  onClose: () => void;
  prefilledType?: MediaType;
  onSaved?: (item: MediaItem) => void | Promise<void>;
  initialData?: Partial<{
    provider: MediaProvider;
    externalId: string;
    title: string;
    coverUrl: string;
    releaseYear: number;
    author: string;
    platform: string;
    genres: string[];
  }>;
}

export function AddItemModal({
  isOpen,
  onClose,
  prefilledType,
  initialData,
  onSaved,
  gentle = false,
}: AddItemModalProps) {
  const [savedItem, setSavedItem] = useState<MediaItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const addItem = useMediaStore((state) => state.addItem);
  const items = useMediaStore((state) => state.items);

  const [formData, setFormData] = useState({
    // Read-only data from API
    title: initialData?.title || '',
    type: prefilledType || ('BOOK' as MediaType),
    coverUrl: initialData?.coverUrl || '',
    author: initialData?.author || '',
    platform: initialData?.platform || '',
    releaseYear: initialData?.releaseYear || (undefined as number | undefined),
    genres: initialData?.genres || [],

    // Editable user data
    status: 'WANT_TO_READ' as MediaStatus,
    rating: null as number | null,
    review: '',
  });

  // Update status when type changes
  useEffect(() => {
    if (prefilledType) {
      setFormData((prev) => ({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    if (savedItem) {
      setIsSaving(true);
      try {
        if (onSaved) await onSaved(savedItem);
        onClose();
      } catch {
        toast.error(
          'El título está guardado, pero falta guardar el progreso de bienvenida. Reintenta.',
        );
      } finally {
        setIsSaving(false);
      }
      return;
    }

    // Validate title
    const titleValidation = isValidTitle(formData.title);
    if (!titleValidation.valid) {
      toast.error(titleValidation.message || 'Título inválido');
      return;
    }

    // Validate rating
    if (formData.rating !== null && !isValidRating(formData.rating)) {
      toast.error('La valoración debe estar entre 0 y 5');
      return;
    }

    // Validate review
    const reviewValidation = isValidReview(formData.review);
    if (!reviewValidation.valid) {
      toast.error(reviewValidation.message || 'Reseña inválida');
      return;
    }

    // Check for duplicates in library
    const normalizedTitle = titleValidation.sanitized!.trim().toLowerCase();
    const existingItem = items.find((item) =>
      sameMedia(item, {
        type: formData.type,
        title: normalizedTitle,
        provider: initialData?.provider,
        externalId: initialData?.externalId,
      }),
    );

    if (existingItem) {
      toast.error('Este elemento ya existe en tu biblioteca');
      return;
    }

    const newItem = {
      id: crypto.randomUUID(),
      title: titleValidation.sanitized!,
      type: formData.type,
      coverUrl: formData.coverUrl || '',
      provider: initialData?.provider,
      externalId: initialData?.externalId,
      status: formData.status,
      rating: formData.rating,
      review: reviewValidation.sanitized || formData.review || undefined,
      author: formData.author ? formData.author.trim().slice(0, 100) : undefined,
      platform: formData.platform ? formData.platform.trim().slice(0, 100) : undefined,
      releaseYear: formData.releaseYear,
      genres: formData.genres,
      createdAt: new Date().toISOString(),
    };

    setIsSaving(true);
    try {
      const saved = await addItem(newItem);
      setSavedItem(saved);
      toast.success(`"${formData.title}" añadido a tu biblioteca`);
      if (onSaved) await onSaved(saved);
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'No se pudo guardar. Inténtalo de nuevo.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isSaving) onClose();
      }}
      title={gentle ? 'Guarda tu primer título' : 'Añadir a tu Biblioteca'}
      size={gentle ? 'md' : 'lg'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Item Preview - Read Only */}
        <div className="kata-panel kata-panel--subtle p-4 sm:p-6">
          <div className={`flex items-start gap-3 sm:gap-4 ${gentle ? '' : 'mb-4'}`}>
            <div className="relative h-28 w-20 sm:h-32 sm:w-24 flex-shrink-0 rounded-lg overflow-hidden bg-white/5 border border-white/10">
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
                <h3 className="kata-title-dialog line-clamp-2 flex-1">
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
                <p className="text-xs text-[var(--text-tertiary)]">{formData.releaseYear}</p>
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

          {!gentle && (
            <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] pt-3 border-t border-white/5">
              <Lock size={12} />
              <span>Sobre este título</span>
            </div>
          )}
        </div>

        {/* Editable Fields */}
        <div className="space-y-6">
          {!gentle && (
            <div className="border-b border-white/10 pb-2">
              <h4 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                Tu Información
              </h4>
            </div>
          )}

          {/* Status */}
          <div>
            <label className="kata-label">{gentle ? '¿Por dónde vas?' : 'Estado *'}</label>
            <Select
              aria-label="Estado"
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value as MediaStatus })}
              options={statusOptions}
            />
          </div>

          {gentle && (
            <p className="text-sm text-[var(--text-secondary)]">
              Con guardarlo es suficiente. Puedes puntuarlo y añadir notas más adelante.
            </p>
          )}
          <details open={gentle ? undefined : true} className="space-y-5">
            <summary className={gentle ? 'cursor-pointer text-sm text-emerald-300' : 'hidden'}>
              Añadir valoración o nota{' '}
              <span className="text-[var(--text-secondary)]">(opcional)</span>
            </summary>
            {/* Rating */}
            <div>
              <label className="kata-label">Valoración</label>
              <RatingInput
                value={formData.rating}
                onChange={(value) => setFormData({ ...formData, rating: value })}
              />
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">Opcional - Valora de 0 a 5</p>
            </div>

            {/* Review */}
            <div>
              <label className="kata-label">Reseña / Notas</label>
              <TextArea
                aria-label="Reseña / Notas"
                value={formData.review}
                onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                className="w-full"
                rows={4}
                maxLength={500}
                placeholder="¿Qué te pareció? (opcional)"
              />
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                Opcional - Tus pensamientos y notas personales
              </p>
            </div>
          </details>
        </div>

        {/* Actions: apilados a ancho completo en móvil */}
        <div className="kata-action-row">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isSaving}>
            {savedItem
              ? 'Continuar con el título guardado'
              : gentle
                ? 'Guardar en mi biblioteca'
                : 'Añadir a Biblioteca'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
