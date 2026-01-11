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
import { Search, Loader2 } from 'lucide-react';

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
    review: string;
  }>;
}

export function AddItemModal({ isOpen, onClose, prefilledType, initialData }: AddItemModalProps) {
  const addItem = useMediaStore((state) => state.addItem);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    type: prefilledType || ('BOOK' as MediaType),
    coverUrl: initialData?.coverUrl || '',
    status: 'WANT_TO_READ' as MediaStatus,
    rating: null as number | null,
    review: initialData?.review || '',
    author: initialData?.author || '',
    platform: initialData?.platform || '',
    releaseYear: initialData?.releaseYear || undefined as number | undefined,
  });

  const [isSearchMode, setIsSearchMode] = useState(false);

  const typeOptions = Object.entries(TYPE_LABELS).map(([value, label]) => ({
    value,
    label: `${TYPE_ICONS[value as MediaType]} ${label}`,
  }));

  const statusOptions = VALID_STATUSES[formData.type].map((status) => ({
    value: status,
    label: STATUS_LABELS[status],
  }));

  const handleTypeChange = (newType: string) => {
    const type = newType as MediaType;
    setFormData({
      ...formData,
      type,
      status: VALID_STATUSES[type][0],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    const newItem = {
      id: crypto.randomUUID(),
      title: formData.title.trim(),
      type: formData.type,
      coverUrl: formData.coverUrl || 'https://via.placeholder.com/300x450?text=No+Cover',
      status: formData.status,
      rating: formData.rating,
      review: formData.review || undefined,
      author: formData.author || undefined,
      platform: formData.platform || undefined,
      releaseYear: formData.releaseYear,
      createdAt: new Date().toISOString(),
    };

    addItem(newItem);
    toast.success(`Added "${formData.title}" to your kata`);
    onClose();

    // Reset form
    setFormData({
      title: '',
      type: 'BOOK',
      coverUrl: '',
      status: 'WANT_TO_READ',
      rating: null,
      review: '',
      author: '',
      platform: '',
      releaseYear: undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Item" size="lg">
      <div className="space-y-6">
        {/* Type Selection */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
            Type
          </label>
          <Select
            value={formData.type}
            onChange={handleTypeChange}
            options={typeOptions}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Fields - similar to before but prefilled */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-[var(--bg-tertiary)] p-3 text-sm text-white placeholder-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                Release Year
              </label>
              <input
                type="number"
                value={formData.releaseYear || ''}
                onChange={(e) => setFormData({ ...formData, releaseYear: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full rounded-lg border border-white/10 bg-[var(--bg-tertiary)] p-3 text-sm text-white"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                {formData.type === 'BOOK' ? 'Author' : formData.type === 'GAME' ? 'Platform' : 'Creator/Director'}
              </label>
              <input
                type="text"
                value={formData.type === 'BOOK' ? formData.author : formData.platform}
                onChange={(e) => setFormData({ ...formData, [formData.type === 'BOOK' ? 'author' : 'platform']: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-[var(--bg-tertiary)] p-3 text-sm text-white"
              />
            </div>
          </div>

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

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
              Rating
            </label>
            <RatingInput
              value={formData.rating}
              onChange={(value) => setFormData({ ...formData, rating: value })}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
              Review / Notes
            </label>
            <textarea
              value={formData.review}
              onChange={(e) => setFormData({ ...formData, review: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-[var(--bg-tertiary)] p-3 text-sm text-white focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Item
            </Button>
          </div>
        </form>

      </div>
    </Modal>
  );
}
