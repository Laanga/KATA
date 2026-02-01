'use client';

import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Edit, Palette, Trash2 } from 'lucide-react';
import { Collection } from '@/types/collections';
import { DEFAULT_COLLECTION_COLORS } from '@/types/collections';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface CollectionActionMenuProps {
  collection: Collection;
  isOpen: boolean;
  onClose: () => void;
  onEditName: () => void;
  onChangeColor: (color: string) => void;
  onDelete: () => void;
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
  const colorPickerButtonRef = useRef<HTMLButtonElement>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [colorPickerPosition, setColorPickerPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (!isConfirmOpen && !isColorPickerOpen) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen, onClose, isConfirmOpen, isColorPickerOpen]);

  useEffect(() => {
    if (isColorPickerOpen && colorPickerButtonRef.current) {
      const rect = colorPickerButtonRef.current.getBoundingClientRect();
      setColorPickerPosition({
        top: rect.top + window.scrollY,
        left: rect.right + window.scrollX + 8,
      });
    } else {
      setColorPickerPosition(null);
    }
  }, [isColorPickerOpen]);

  useGSAP(
    () => {
      if (isOpen) {
        gsap.fromTo(
          containerRef.current,
          { opacity: 0, scale: 0.95, y: -10 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.2,
            ease: 'back.out(1.7)',
          }
        );
      }
    },
    [isOpen]
  );

  const handleClose = () => {
    gsap.to(containerRef.current, {
      opacity: 0,
      scale: 0.95,
      y: -10,
      duration: 0.15,
      ease: 'power2.in',
      onComplete: onClose,
    });
  };

  const handleDeleteClick = () => {
    setIsConfirmOpen(true);
  };

  const handleChangeColor = (color: string) => {
    onChangeColor(color);
    setIsColorPickerOpen(false);
    setTimeout(() => handleClose(), 50);
  };

  if (!isOpen) return null;

  const menuContent = (
    <div
      ref={containerRef}
      className="fixed w-64 bg-[var(--bg-secondary)] rounded-xl border border-white/10 shadow-2xl z-[100] overflow-hidden backdrop-blur-xl"
      style={{
        top: position?.top ? `${position.top}px` : 'auto',
        left: position?.right ? `calc(100vw - ${position.right}px + 12px)` : 'auto',
      }}
    >
      <div className="relative">
        <div className="p-4 pb-2">
          <div className="flex items-center gap-3 mb-2">
            {collection.color && (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  backgroundColor: `${collection.color}20`,
                  boxShadow: `0 0 12px ${collection.color}40`,
                }}
              >
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: collection.color }} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">{collection.name}</h3>
              <p className="text-xs text-[var(--text-tertiary)]">Colección</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 my-1" />

        <div className="p-1.5 space-y-0.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
              setTimeout(onEditName, 150);
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <Edit size={14} className="text-[var(--text-secondary)]" />
            </div>
            <span className="text-sm text-[var(--text-secondary)] group-hover:text-white transition-colors">Editar nombre</span>
          </button>

          <button
            ref={colorPickerButtonRef}
            type="button"
            onClick={() => {
              setIsColorPickerOpen(!isColorPickerOpen);
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <Palette size={14} className="text-[var(--text-secondary)]" />
              </div>
              <span className="text-sm text-[var(--text-secondary)] group-hover:text-white transition-colors">Cambiar color</span>
            </div>
            {collection.color && (
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: collection.color }} />
            )}
          </button>
        </div>

        <div className="border-t border-white/10 my-1" />

        <div className="p-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 transition-all group"
          >
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
              <Trash2 size={14} className="text-red-400" />
            </div>
            <span className="text-sm text-red-400 group-hover:text-red-300 transition-colors">Eliminar colección</span>
          </button>
        </div>
      </div>
    </div>
  );

  const colorPickerContent = isColorPickerOpen && colorPickerPosition ? (
    <div
      className="fixed w-44 bg-[var(--bg-tertiary)] rounded-lg border border-white/5 shadow-2xl z-[150] p-2 animate-in fade-in duration-200"
      style={{
        top: `${colorPickerPosition.top}px`,
        left: `${colorPickerPosition.left}px`,
      }}
    >
      <div className="grid grid-cols-6 gap-1.5">
        {DEFAULT_COLLECTION_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleChangeColor(color);
            }}
            className={`w-6 h-6 rounded-md transition-transform hover:scale-110 active:scale-95 ${
              collection.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[var(--bg-tertiary)]' : ''
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  ) : null;

  return (
    <>
      {typeof document !== 'undefined' && createPortal(menuContent, document.body)}
      {typeof document !== 'undefined' && colorPickerContent && createPortal(colorPickerContent, document.body)}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
        }}
        onConfirm={() => {
          onDelete();
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
