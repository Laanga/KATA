'use client';

import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Edit, Palette, Trash2 } from 'lucide-react';
import { Collection, DEFAULT_COLLECTION_COLORS } from '@/types/collections';
import { Button } from '@/components/ui/Button';
import { ColorSwatch } from '@/components/ui/Choice';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface CollectionActionMenuProps {
  collection: Collection;
  isOpen: boolean;
  onClose: () => void;
  onEditName: () => void;
  onChangeColor: (color: string) => void | Promise<void>;
  onDelete: () => void | Promise<void>;
  position?: { top: number; right: number };
}

export function CollectionActionMenu({
  collection,
  isOpen,
  onClose,
  onEditName,
  onChangeColor,
  onDelete,
  position,
}: CollectionActionMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    containerRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const outside = (event: MouseEvent) => {
      if (
        !isConfirmOpen &&
        !isColorPickerOpen &&
        !containerRef.current?.contains(event.target as Node)
      )
        onClose();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isConfirmOpen && !isColorPickerOpen) {
        onClose();
        previousFocus?.focus();
      }
    };
    document.addEventListener('click', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('click', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [isOpen, onClose, isConfirmOpen, isColorPickerOpen]);
  if (!isOpen || typeof document === 'undefined') return null;
  return (
    <>
      {createPortal(
        <div
          ref={containerRef}
          aria-label={`Acciones de ${collection.name}`}
          className="kata-popover fixed w-64 max-w-[calc(100vw-2rem)] z-[100] overflow-hidden p-2"
          style={{
            top: Math.max(16, Math.min(position?.top ?? 80, window.innerHeight - 260)),
            right: Math.max(16, Math.min(position?.right ?? 16, window.innerWidth - 272)),
          }}
        >
          <div className="px-3 py-3 border-b border-[var(--kata-border)] mb-2">
            <h3 className="kata-title-dialog truncate">{collection.name}</h3>
            <p className="text-xs text-[var(--text-secondary)]">Colección</p>
          </div>
          <Button variant="ghost" className="w-full justify-start" onClick={onEditName}>
            <Edit size={16} />
            Editar nombre
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setIsColorPickerOpen(true)}
          >
            <Palette size={16} />
            Cambiar color
          </Button>
          <Button
            variant="danger"
            className="w-full justify-start mt-2"
            onClick={() => setIsConfirmOpen(true)}
          >
            <Trash2 size={16} />
            Eliminar colección
          </Button>
        </div>,
        document.body,
      )}
      <Modal
        isOpen={isColorPickerOpen}
        onClose={() => {
          if (!saving) setIsColorPickerOpen(false);
        }}
        title="Color de colección"
        size="sm"
      >
        <div className="flex flex-wrap gap-2" aria-label="Colores disponibles">
          {DEFAULT_COLLECTION_COLORS.map((color) => (
            <ColorSwatch
              key={color}
              color={color}
              selected={collection.color === color}
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                setError('');
                try {
                  await onChangeColor(color);
                  onClose();
                } catch {
                  setError('No pudimos guardar el color. Inténtalo de nuevo.');
                } finally {
                  setSaving(false);
                }
              }}
            />
          ))}
        </div>
        {error && (
          <p role="alert" className="mt-4 text-sm text-[var(--kata-danger)]">
            {error}
          </p>
        )}
      </Modal>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={async () => {
          await onDelete();
          setIsConfirmOpen(false);
        }}
        title="Eliminar colección"
        message={`¿Estás seguro de que quieres eliminar "${collection.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </>
  );
}
