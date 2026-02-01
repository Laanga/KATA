'use client';

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
          <label htmlFor="name" className="block text-sm font-medium text-foreground">
            Nombre *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Animes vistos en 2024"
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-foreground placeholder:text-muted-foreground"
            autoFocus
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_COLLECTION_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                  selectedColor === color ? 'ring-2 ring-offset-2 ring-offset-background ring-foreground' : ''
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent/10 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 rounded-lg bg-accent text-accent-foreground hover:opacity-90 transition-opacity"
          >
            Crear Colección
          </button>
        </div>
      </form>
    </Modal>
  );
}
