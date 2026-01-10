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
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Item" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Item Info */}
        <div className="flex gap-4">
          <img
            src={item.coverUrl}
            alt={item.title}
            className="h-32 w-24 rounded-lg object-cover"
          />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              {item.author || item.platform || item.releaseYear}
            </p>
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
            Status
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
            Rating
          </label>
          <RatingInput
            value={formData.rating}
            onChange={(value) => setFormData({ ...formData, rating: value })}
          />
        </div>

        {/* Review */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
            Review (optional)
          </label>
          <textarea
            value={formData.review}
            onChange={(e) => setFormData({ ...formData, review: e.target.value })}
            placeholder="Write your thoughts..."
            className="w-full rounded-lg border border-white/10 bg-[var(--bg-tertiary)] p-3 text-sm text-white placeholder-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
            rows={4}
            maxLength={500}
          />
          <p className="mt-1 text-xs text-[var(--text-tertiary)]">
            {formData.review.length}/500
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
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
