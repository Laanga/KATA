'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Star, MoreVertical, Trash2, Edit } from 'lucide-react';
import { MediaItem } from '@/types/media';
import { TYPE_COLORS, STATUS_LABELS, STATUS_COLORS } from '@/lib/utils/constants';
import { useMediaStore } from '@/lib/store';
import { EditItemModal } from './EditItemModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';

interface KataCardProps {
  item: MediaItem;
}

export function KataCard({ item }: KataCardProps) {
  const container = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const [showActions, setShowActions] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const deleteItem = useMediaStore((state) => state.deleteItem);

  useGSAP(() => {
    const card = container.current;
    if (!card) return;

    const tl = gsap.timeline({ paused: true });

    tl.to(overlay.current, {
      opacity: 1,
      duration: 0.3,
      ease: 'power2.out'
    })
    .to('.card-actions', {
      y: 0,
      opacity: 1,
      duration: 0.2,
      stagger: 0.05
    }, '<0.1')
    .to(card, {
      scale: 1.02,
      duration: 0.3,
      ease: 'back.out(1.2)'
    }, '<');

    const handleMouseMove = (e: MouseEvent) => {
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      gsap.to(card, {
        rotationX: rotateX,
        rotationY: rotateY,
        duration: 0.3,
        ease: 'power2.out',
        transformPerspective: 1000,
      });

      gsap.to(imageRef.current, {
        x: ((x - centerX) / centerX) * 10,
        y: ((y - centerY) / centerY) * 10,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      tl.reverse();
      setShowActions(false);

      gsap.to(card, {
        rotationX: 0,
        rotationY: 0,
        scale: 1,
        duration: 0.5,
        ease: 'power2.out',
      });

      gsap.to(imageRef.current, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
      });
    };

    card.addEventListener('mouseenter', () => tl.play());
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', () => tl.play());
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, { scope: container });

  const handleDeleteConfirm = () => {
    gsap.to(container.current, {
      scale: 0.8,
      opacity: 0,
      duration: 0.3,
      ease: 'back.in(2)',
      onComplete: () => {
        toast.success(`"${item.title}" eliminado de tu kata`);
        deleteItem(item.id);
      }
    });
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditModalOpen(true);
    setShowActions(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
    setShowActions(false);
  };

  return (
    <>
      <div
        ref={container}
        className="group relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-[var(--bg-secondary)] shadow-lg will-change-transform"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div ref={imageRef} className="absolute inset-0 will-change-transform">
          <Image
            src={item.coverUrl}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        </div>

        <div
          className="absolute top-2 right-2 h-2 w-2 rounded-full shadow-lg animate-pulse"
          style={{ 
            backgroundColor: TYPE_COLORS[item.type],
            boxShadow: `0 0 10px ${TYPE_COLORS[item.type]}`
          }}
        />

        <div
          ref={overlay}
          className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 opacity-0"
          style={{ transform: 'translateZ(20px)' }}
        >
          <h3 className="line-clamp-2 font-bold text-white leading-tight mb-1">
            {item.title}
          </h3>

          <p className="text-xs text-[var(--text-secondary)] mb-1 line-clamp-1">
            {item.author || item.platform || item.releaseYear}
          </p>

          <div className="flex items-center gap-1 text-[var(--accent-warning)] mb-2">
            <Star size={14} fill="currentColor" className="animate-pulse" />
            <span className="text-sm font-medium">
              {item.rating !== null ? item.rating.toFixed(1) : '—'}
            </span>
          </div>

          <div
            className="text-xs font-medium mb-3 transition-colors"
            style={{ color: STATUS_COLORS[item.status] }}
          >
            {STATUS_LABELS[item.status]}
          </div>

          <div className="flex items-center justify-between card-actions translate-y-2 opacity-0">
            <button
              className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-all hover:scale-110 active:scale-95 touch-target-mobile"
              onClick={handleEdit}
              aria-label="Editar"
            >
              <Edit size={16} />
            </button>
            <button
              className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-all hover:scale-110 active:scale-95 touch-target-mobile"
              onClick={() => setShowActions(!showActions)}
              aria-label="Más opciones"
            >
              <MoreVertical size={16} />
            </button>
          </div>

          {showActions && (
            <div className="absolute bottom-12 right-4 rounded-lg border border-white/10 bg-[var(--bg-primary)] p-2 shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
              <button
                onClick={handleDeleteClick}
                className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors touch-target-mobile"
              >
                <Trash2 size={16} />
                Eliminar
              </button>
            </div>
          )}
        </div>

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"
            style={{ transform: 'skewX(-20deg)' }}
          />
        </div>
      </div>

      <EditItemModal
        item={item}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Elemento"
        message={`¿Estás seguro de que quieres eliminar "${item.title}" de tu biblioteca? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </>
  );
}
