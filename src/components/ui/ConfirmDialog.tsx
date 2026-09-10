'use client';

import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
}: ConfirmDialogProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const handleConfirm = async () => {
    if (isConfirming) return;
    setIsConfirming(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      /* The caller displays the operation error; keep the dialog open. */
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isConfirming) onClose();
      }}
      title={title}
      size="sm"
    >
      <div className="text-center py-4">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>

        <p className="mb-6 text-sm text-[var(--text-secondary)]">{message}</p>

        <div className="kata-action-row">
          <Button variant="ghost" onClick={onClose} disabled={isConfirming}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={handleConfirm} isLoading={isConfirming}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
