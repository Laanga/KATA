'use client';
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
          <label htmlFor="name" className="block text-sm font-medium text-[var(--text-secondary)]">
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
          <label className="block text-sm font-medium text-[var(--text-secondary)]">Color</label>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_COLLECTION_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full transition-all hover:scale-110 active:scale-95 ${
                  selectedColor === color
                    ? 'ring-2 ring-white/80 ring-offset-2 ring-offset-[#141414] scale-110'
                    : ''
                }`}
                style={{
                  backgroundColor: color,
                  boxShadow:
                    selectedColor === color
                      ? `0 0 14px color-mix(in srgb, ${color} 50%, transparent)`
                      : undefined,
                }}
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
