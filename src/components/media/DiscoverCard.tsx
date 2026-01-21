'use client';

import Image from 'next/image';
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Calendar, Plus } from 'lucide-react';
import { MediaType } from '@/types/media';

interface DiscoverCardProps {
  item: any;
  type: MediaType;
  onAdd: () => void;
  getImage: (item: any) => string;
  getTitle: (item: any) => string;
  releaseDate?: string;
  rating?: number;
}

export function DiscoverCard({ item, type, onAdd, getImage, getTitle, releaseDate, rating }: DiscoverCardProps) {
  const container = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const card = container.current;
    if (!card) return;

    const tl = gsap.timeline({ paused: true });

    tl.to(overlay.current, {
      opacity: 1,
      duration: 0.3,
      ease: 'power2.out'
    })
    .to('.discover-card-btn', {
      y: 0,
      opacity: 1,
      duration: 0.2,
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

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Animación de confirmación
    gsap.to(container.current, {
      scale: 0.95,
      duration: 0.1,
      ease: 'power2.in',
      onComplete: () => {
        gsap.to(container.current, {
          scale: 1,
          duration: 0.3,
          ease: 'back.out(2)',
        });
      }
    });
    
    onAdd();
  };

  const title = getTitle(item);
  const image = getImage(item);

  return (
    <div
      ref={container}
      className="group relative aspect-[2/3] w-44 flex-shrink-0 overflow-hidden rounded-lg bg-[var(--bg-secondary)] shadow-lg will-change-transform cursor-pointer"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Imagen con parallax */}
      <div ref={imageRef} className="absolute inset-0 will-change-transform">
        {image && image !== '/placeholder-cover.jpg' ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="176px"
            unoptimized={image.includes('rawg.io') || image.includes('igdb.com') || image.includes('openlibrary.org')}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-secondary)] flex items-center justify-center">
            <span className="text-4xl opacity-30">🎬</span>
          </div>
        )}
      </div>

      {/* Badge de rating si existe */}
      {rating && (
        <div 
          className="absolute top-2 right-2 px-2 py-1 rounded-full bg-[var(--accent-primary)] flex items-center gap-1 z-10"
          style={{ transform: 'translateZ(30px)' }}
        >
          <span className="text-xs font-bold text-black">{rating.toFixed(1)}</span>
          <span className="text-[10px] text-black/70">★</span>
        </div>
      )}

      {/* Overlay con info */}
      <div
        ref={overlay}
        className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/50 to-transparent p-3 opacity-0"
        style={{ transform: 'translateZ(20px)' }}
      >
        {/* Fecha de lanzamiento */}
        {releaseDate && (
          <div className="flex items-center gap-1.5 text-[var(--accent-primary)] mb-2">
            <Calendar size={12} />
            <span className="text-xs font-medium">{releaseDate}</span>
          </div>
        )}

        {/* Título */}
        <h3 className="line-clamp-2 font-bold text-white text-sm leading-tight mb-3">
          {title}
        </h3>

        {/* Botón añadir */}
        <button
          onClick={handleAddClick}
          className="discover-card-btn w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--accent-primary)] py-2 text-black text-xs font-semibold hover:bg-[var(--accent-primary)]/90 transition-all translate-y-2 opacity-0 active:scale-95"
        >
          <Plus size={14} />
          Añadir
        </button>
      </div>

      {/* Efecto de brillo */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"
          style={{ transform: 'skewX(-20deg)' }}
        />
      </div>
    </div>
  );
}
