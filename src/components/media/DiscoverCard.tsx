'use client';
import { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { MediaCover } from './MediaCover';
import type { MediaResult } from '@/lib/media/results';
import { Button } from '../ui/Button';
export function DiscoverCard({
  item,
  onAdd,
  isInLibrary = false,
}: {
  item: MediaResult;
  onAdd: () => Promise<void>;
  isInLibrary?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <article className="kata-panel kata-panel--subtle p-0 w-40 sm:w-48 shrink-0 overflow-hidden">
      <div className="relative aspect-[2/3]">
        <MediaCover src={item.coverUrl || ''} alt="" fill sizes="192px" className="object-cover" />
      </div>
      <div className="p-3">
        <h3 className="kata-title-dialog line-clamp-2 min-h-12">{item.title}</h3>
        <p className="text-xs text-[var(--text-secondary)] mt-2">
          {item.releaseDate
            ? new Date(item.releaseDate).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : item.year || 'Fecha por confirmar'}
        </p>
        <Button
          size="sm"
          variant="outline"
          className="mt-3 w-full"
          isLoading={busy}
          disabled={isInLibrary}
          onClick={async () => {
            if (busy) return;
            setBusy(true);
            try {
              await onAdd();
            } catch {
              /* The page reports the error. */
            } finally {
              setBusy(false);
            }
          }}
        >
          {isInLibrary ? (
            <>
              <Check size={14} />
              En tu biblioteca
            </>
          ) : (
            <>
              <Plus size={14} />
              Pendiente
            </>
          )}
        </Button>
      </div>
    </article>
  );
}
