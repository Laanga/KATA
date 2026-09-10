'use client';
import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { IconButton } from './Button';
import { cn } from '@/lib/utils/cn';
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
// Native modal dialogs provide focus containment, inert background and focus return.
export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!isOpen || !dialog) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [isOpen]);
  if (!isOpen || typeof document === 'undefined') return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return createPortal(
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 text-white backdrop:bg-black/70 backdrop:backdrop-blur-sm open:flex open:items-end sm:open:items-center open:justify-center sm:p-6"
    >
      <div
        className={cn(
          'kata-dialog-panel w-full max-h-[92dvh] sm:max-h-[88dvh] flex flex-col max-sm:rounded-b-none',
          sizes[size],
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 shrink-0">
          <h2 id={titleId} className={title ? 'kata-title-dialog' : 'sr-only'}>
            {title || 'Confirmación'}
          </h2>
          <IconButton
            type="button"
            autoFocus
            onClick={onClose}
            label="Cerrar diálogo"
            className="ml-auto"
          >
            <X size={20} />
          </IconButton>
        </div>
        <div
          className="overflow-y-auto overscroll-contain px-5 py-5 sm:px-6"
          data-lenis-prevent
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1.5rem)' }}
        >
          {children}
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
