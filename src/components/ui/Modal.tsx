'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      
      // Lock body scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        // Restore body scroll
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      };
    }
  }, [isOpen]);

  // GSAP Animation
  useGSAP(() => {
    if (isOpen) {
      // Open animation
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: 'power2.out' }
      );
      gsap.fromTo(
        contentRef.current,
        { scale: 0.9, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: 'back.out(1.7)' }
      );
    }
  }, [isOpen]);

  const handleClose = () => {
    // Close animation
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.2,
      onComplete: onClose,
    });
    gsap.to(contentRef.current, {
      scale: 0.9,
      opacity: 0,
      y: 20,
      duration: 0.2,
    });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog" 
      aria-modal="true"
    >
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={handleOverlayClick}
      />

      {/* Modal Container */}
      <div className="relative h-full flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        {/* Content */}
        <div
          ref={contentRef}
          className={cn(
            'relative w-full max-h-[90vh] flex flex-col rounded-2xl border border-white/10 bg-[var(--bg-secondary)] shadow-2xl',
            sizeClasses[size]
          )}
        >
          {/* Header - Sticky */}
          {title && (
            <div className="flex items-center justify-between border-b border-white/10 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 bg-[var(--bg-secondary)] z-10 rounded-t-2xl flex-shrink-0">
              <h2 className="text-lg sm:text-xl font-bold text-white">{title}</h2>
              <button
                onClick={handleClose}
                className="rounded-lg p-1.5 sm:p-2 text-[var(--text-secondary)] transition-colors hover:bg-white/5 hover:text-white"
                aria-label="Cerrar modal"
              >
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          )}

          {/* Body - Scrollable */}
          <div 
            ref={bodyRef} 
            className="px-4 sm:px-6 py-4 sm:py-6 overflow-y-auto overflow-x-hidden flex-1 overscroll-contain"
            style={{ 
              maxHeight: title ? 'calc(90vh - 80px)' : '90vh',
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain'
            }}
            onWheel={(e) => {
              // Ensure wheel events work on this element
              e.stopPropagation();
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;

  return createPortal(modalContent, document.body);
}
