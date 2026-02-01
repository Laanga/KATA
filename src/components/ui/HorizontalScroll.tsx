'use client';

import { useRef, useState, useEffect, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalScrollProps {
  children: ReactNode;
  showArrows?: boolean;
}

export function HorizontalScroll({ 
  children, 
  showArrows = true, 
}: HorizontalScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = () => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScrollability();
    el.addEventListener('scroll', checkScrollability);
    
    // Observer para detectar cambios en el contenido
    const resizeObserver = new ResizeObserver(checkScrollability);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener('scroll', checkScrollability);
      resizeObserver.disconnect();
    };
  }, [children]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollAmount = el.clientWidth * 0.8;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative group">
      {/* Contenedor del scroll */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
      >
        {children}
      </div>

      {/* Gradientes laterales */}
      <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-[var(--bg-primary)] to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-[var(--bg-primary)] to-transparent pointer-events-none" />

      {/* Flechas de navegación */}
      {showArrows && (
        <>
          <button
            onClick={() => scroll('left')}
            className={`
              absolute left-2 top-1/2 -translate-y-1/2 z-10
              w-10 h-10 rounded-full bg-[var(--bg-secondary)]/90 backdrop-blur-sm
              border border-white/10 shadow-lg
              flex items-center justify-center
              transition-all duration-300
              ${canScrollLeft 
                ? 'opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-[var(--bg-tertiary)]' 
                : 'opacity-0 pointer-events-none'
              }
            `}
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>

          <button
            onClick={() => scroll('right')}
            className={`
              absolute right-2 top-1/2 -translate-y-1/2 z-10
              w-10 h-10 rounded-full bg-[var(--bg-secondary)]/90 backdrop-blur-sm
              border border-white/10 shadow-lg
              flex items-center justify-center
              transition-all duration-300
              ${canScrollRight 
                ? 'opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-[var(--bg-tertiary)]' 
                : 'opacity-0 pointer-events-none'
              }
            `}
            aria-label="Scroll right"
          >
            <ChevronRight size={20} className="text-white" />
          </button>
        </>
      )}
    </div>
  );
}
