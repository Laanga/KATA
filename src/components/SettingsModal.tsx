'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useMediaStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { Download, Upload, Trash2 } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const items = useMediaStore((state) => state.items);
  const setItems = useMediaStore((state) => state.setItems);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleExport = () => {
    const dataStr = JSON.stringify(items, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `kata-export-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success('Library exported successfully');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data)) {
          setItems(data);
          toast.success(`Imported ${data.length} items`);
          onClose();
        } else {
          toast.error('Invalid file format');
        }
      } catch (error) {
        toast.error('Failed to import file');
      }
    };
    reader.readAsText(file);
  };

  const handleClearLibrary = () => {
    setItems([]);
    setShowClearConfirm(false);
    toast.success('Library cleared');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="md">
      <div className="space-y-6">
        {/* User Info Section */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
            Profile
          </h3>
          <div className="space-y-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
                Username
              </label>
              <input
                type="text"
                defaultValue="Langa"
                disabled
                className="w-full rounded-lg border border-white/10 bg-[var(--bg-tertiary)] p-3 text-sm text-white placeholder-[var(--text-tertiary)] opacity-50"
              />
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">
                Username customization coming soon
              </p>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
            Data Management
          </h3>
          <div className="space-y-3">
            {/* Export */}
            <button
              onClick={handleExport}
              className="flex w-full items-center gap-3 rounded-lg border border-white/10 bg-[var(--bg-tertiary)] p-4 text-left transition-colors hover:bg-[var(--bg-tertiary)]/80"
            >
              <Download size={20} className="text-[var(--accent-primary)]" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Export Library</p>
                <p className="text-xs text-[var(--text-tertiary)]">
                  Download your data as JSON ({items.length} items)
                </p>
              </div>
            </button>

            {/* Import */}
            <label className="flex w-full cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-[var(--bg-tertiary)] p-4 transition-colors hover:bg-[var(--bg-tertiary)]/80">
              <Upload size={20} className="text-[var(--accent-primary)]" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Import Library</p>
                <p className="text-xs text-[var(--text-tertiary)]">
                  Restore from a previous export
                </p>
              </div>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>

            {/* Clear Library */}
            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex w-full items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-left transition-colors hover:bg-red-500/10"
              >
                <Trash2 size={20} className="text-red-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-400">Clear Library</p>
                  <p className="text-xs text-red-400/70">
                    Remove all items from your library
                  </p>
                </div>
              </button>
            ) : (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                <p className="mb-3 text-sm text-red-400">
                  Are you sure? This will permanently delete all {items.length} items.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowClearConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={handleClearLibrary}
                  >
                    Yes, Clear All
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* App Info */}
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
            About
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-tertiary)]">Version</span>
              <span className="text-white">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-tertiary)]">Total Items</span>
              <span className="text-white">{items.length}</span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t border-white/10">
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
