'use client';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/Field';

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

export function EditCollectionNameModal({
  collection,
  isOpen,
  onClose,
  onUpdate,
}: EditCollectionNameModalProps) {
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
          <label htmlFor="name" className="kata-label">
            Nombre de la colección
          </label>
          <TextInput
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Animes vistos en 2024"
            className="w-full"
            autoFocus
            maxLength={50}
          />
          <p className="text-xs text-[var(--text-tertiary)]">{name.length} / 50 caracteres</p>
        </div>

        <div className="kata-action-row">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
