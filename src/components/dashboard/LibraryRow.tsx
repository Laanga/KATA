'use client';
import { Button } from '@/components/ui/Button';
import { MediaCover } from '@/components/media/MediaCover';
import { TYPE_LABELS, STATUS_LABELS, TYPE_COLORS } from '@/lib/utils/constants';
import type { MediaItem } from '@/types/media';

export function LibraryRow({
  item,
  onEdit,
  recent = false,
}: {
  item: MediaItem;
  onEdit: (item: MediaItem) => void;
  recent?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 py-4">
      <MediaCover
        src={item.coverUrl}
        alt=""
        width={40}
        height={56}
        className="h-14 w-10 shrink-0 rounded object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-sm break-words">{item.title}</p>
        <p className="text-xs mt-1" style={{ color: TYPE_COLORS[item.type] }}>
          {TYPE_LABELS[item.type]}
        </p>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          {recent
            ? `Añadido el ${new Date(item.createdAt).toLocaleDateString('es-ES')}`
            : STATUS_LABELS[item.status]}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2"
          aria-label={`Actualizar ${item.title}`}
          onClick={() => onEdit(item)}
        >
          Actualizar
        </Button>
      </div>
    </div>
  );
}
