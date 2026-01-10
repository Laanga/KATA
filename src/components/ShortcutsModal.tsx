'use client';

import { Modal } from '@/components/ui/Modal';
import { Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  const shortcuts = [
    { keys: ['Ctrl', 'K'], description: 'Open search' },
    { keys: ['Ctrl', 'N'], description: 'Add new item' },
    { keys: ['G', 'H'], description: 'Go to home' },
    { keys: ['G', 'L'], description: 'Go to library' },
    { keys: ['G', 'P'], description: 'Go to profile' },
    { keys: ['?'], description: 'Show shortcuts' },
    { keys: ['Esc'], description: 'Close modal' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" size="md">
      <div className="space-y-4">
        {shortcuts.map((shortcut, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
          >
            <span className="text-sm text-[var(--text-secondary)]">
              {shortcut.description}
            </span>
            <div className="flex gap-2">
              {shortcut.keys.map((key, keyIndex) => (
                <kbd
                  key={keyIndex}
                  className="px-3 py-1 rounded bg-[var(--bg-tertiary)] border border-white/10 text-xs font-mono text-white"
                >
                  {key}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-[var(--bg-tertiary)] border border-white/5">
        <div className="flex items-start gap-3">
          <Keyboard size={20} className="text-[var(--accent-primary)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-white mb-1">Pro tip</p>
            <p className="text-xs text-[var(--text-secondary)]">
              Press <kbd className="px-2 py-0.5 rounded bg-[var(--bg-primary)] border border-white/10 text-xs font-mono">?</kbd> anytime to see all available shortcuts
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
