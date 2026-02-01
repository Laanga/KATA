'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import type { Collection } from '@/types/collections';
import toast from 'react-hot-toast';

interface EditCollectionNameModalProps {
  collection: Collection;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, name: string) => Promise<void>;
}

export function EditCollectionNameModal({ collection, isOpen, onClose, onUpdate }: EditCollectionNameModalProps) {
  const [name, setName] = useState(collection.name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    if (name.trim() === collection.name) {
      onClose();
      return;
    }

    try {
      await onUpdate(collection.id, name.trim());
      toast.success('Nombre actualizado');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar nombre');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar nombre" size="sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-[var(--text-secondary)]">
            Nombre de la colección
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Animes vistos en 2024"
            className="w-full px-4 py-2 bg-[var(--bg-tertiary)] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent text-white placeholder-[var(--text-tertiary)] transition-colors"
            autoFocus
            maxLength={50}
          />
          <p className="text-xs text-[var(--text-tertiary)]">
            {name.length} / 50 caracteres
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-white/10 text-[var(--text-secondary)] hover:bg-white/5 hover:text-white transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-[var(--accent-primary)] text-black hover:bg-[var(--accent-primary)]/90 transition-opacity text-sm font-medium"
          >
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
}
