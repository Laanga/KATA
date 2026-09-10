'use client';
import { ColorSwatch } from '@/components/ui/Choice';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/Field';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useMediaStore } from '@/lib/store';
import { Modal } from '@/components/ui/Modal';
import { DEFAULT_COLLECTION_COLORS } from '@/types/collections';

interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateCollectionModal({ isOpen, onClose }: CreateCollectionModalProps) {
  const createCollection = useMediaStore((state) => state.createCollection);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLLECTION_COLORS[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }

    try {
      await createCollection({
        name: name.trim(),
        color: selectedColor,
      });

      toast.success('Colección creada');
      setName('');
      setSelectedColor(DEFAULT_COLLECTION_COLORS[0]);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear colección');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva Colección" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="name" className="kata-label">
            Nombre *
          </label>
          <TextInput
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Animes vistos en 2024"
            className="w-full"
            autoFocus
          />
        </div>

        <div className="space-y-3">
          <label className="kata-label">Color</label>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_COLLECTION_COLORS.map((color) => (
              <ColorSwatch
                color={color}
                selected={selectedColor === color}
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}

                title={color}
              />
            ))}
          </div>
        </div>

        <div className="kata-action-row">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Crear Colección
          </Button>
        </div>
      </form>
    </Modal>
  );
}
