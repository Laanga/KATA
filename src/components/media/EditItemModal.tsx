'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { RatingInput } from './RatingInput';
import { MediaItem, MediaStatus } from '@/types/media';
import { VALID_STATUSES, STATUS_LABELS } from '@/lib/utils/constants';
import { useMediaStore } from '@/lib/store';
import toast from 'react-hot-toast';

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

    toast.success(`Updated "${item.title}"`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Item" size="lg">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Item Info */}
        <div className="flex gap-6 rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
          <img
            src={item.coverUrl}
            alt={item.title}
            className="h-24 w-16 rounded-lg object-cover shadow-lg"
          />
          <div className="flex flex-1 flex-col justify-center">
            <h3 className="font-bold text-white text-lg leading-tight mb-1">{item.title}</h3>
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              {item.author || item.platform || item.releaseYear}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-[var(--text-secondary)]">
                {item.type}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Status */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              Status
            </label>
            <Select
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value as MediaStatus })}
              options={statusOptions}
              className="h-11 bg-[var(--bg-tertiary)]"
            />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              Rating
            </label>
            <div className="flex h-11 items-center rounded-md border border-white/10 bg-[var(--bg-tertiary)] px-3">
              <RatingInput
                value={formData.rating}
                onChange={(value) => setFormData({ ...formData, rating: value })}
              />
            </div>
          </div>
        </div>

        {/* Review */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              Review
            </label>
            <span className="text-xs text-[var(--text-tertiary)]">
              {formData.review.length}/500
            </span>
          </div>
          <textarea
            value={formData.review}
            onChange={(e) => setFormData({ ...formData, review: e.target.value })}
            placeholder="Write your thoughts..."
            className="min-h-[120px] w-full resize-none rounded-xl border border-white/10 bg-[var(--bg-tertiary)] p-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] transition-colors focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
            maxLength={500}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-white/10 pt-6">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
