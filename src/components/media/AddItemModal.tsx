'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { RatingInput } from './RatingInput';
import { MediaType, MediaStatus } from '@/types/media';
import { VALID_STATUSES, STATUS_LABELS, TYPE_LABELS, TYPE_ICONS } from '@/lib/utils/constants';
import { useMediaStore } from '@/lib/store';
import toast from 'react-hot-toast';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledType?: MediaType;
}

export function AddItemModal({ isOpen, onClose, prefilledType }: AddItemModalProps) {
  const addItem = useMediaStore((state) => state.addItem);
  
  const [formData, setFormData] = useState({
    title: '',
    type: prefilledType || ('BOOK' as MediaType),
    coverUrl: '',
    status: 'WANT_TO_READ' as MediaStatus,
    rating: null as number | null,
    review: '',
    author: '',
    platform: '',
    releaseYear: undefined as number | undefined,
  });

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
      <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* Title */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter title..."
            className="w-full rounded-lg border border-white/10 bg-[var(--bg-tertiary)] p-3 text-sm text-white placeholder-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
            required
          />
        </div>

        {/* Cover URL */}
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
            Cover URL (optional)
          </label>
          <input
            type="url"
            value={formData.coverUrl}
            onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
            placeholder="https://..."
            className="w-full rounded-lg border border-white/10 bg-[var(--bg-tertiary)] p-3 text-sm text-white placeholder-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Author (Books) or Platform (Games) */}
          {formData.type === 'BOOK' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                Author
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Author name..."
                className="w-full rounded-lg border border-white/10 bg-[var(--bg-tertiary)] p-3 text-sm text-white placeholder-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              />
            </div>
          )}

          {formData.type === 'GAME' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                Platform
              </label>
              <input
                type="text"
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                placeholder="PS5, Xbox, PC..."
                className="w-full rounded-lg border border-white/10 bg-[var(--bg-tertiary)] p-3 text-sm text-white placeholder-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
              />
            </div>
          )}

          {/* Release Year */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
              Release Year
            </label>
            <input
              type="number"
              value={formData.releaseYear || ''}
              onChange={(e) => setFormData({ ...formData, releaseYear: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="2024"
              min="1900"
              max={new Date().getFullYear()}
              className="w-full rounded-lg border border-white/10 bg-[var(--bg-tertiary)] p-3 text-sm text-white placeholder-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
            />
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
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Add Item
          </Button>
        </div>
      </form>
    </Modal>
  );
}
