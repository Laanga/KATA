'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { AddItemModal } from '@/components/media/AddItemModal';
import { MediaType } from '@/types/media';

interface FloatingAddButtonProps {
  prefilledType?: MediaType;
}

export function FloatingAddButton({ prefilledType }: FloatingAddButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-primary)] text-black shadow-2xl transition-all hover:scale-110 hover:shadow-[0_0_30px_var(--accent-primary)] active:scale-95"
        aria-label="Add new item"
      >
        <Plus size={24} />
      </button>

      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        prefilledType={prefilledType}
      />
    </>
  );
}
