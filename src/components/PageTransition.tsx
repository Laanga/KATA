'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';

/**
 * Page transition component
 * Animates in/out when route changes
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */

  // Asegurarse de que estamos en el cliente
    
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!contentRef.current || !isClient) return;

    // Page enter animation with scale and fade
    gsap.fromTo(
      contentRef.current,
      {
        opacity: 0,
        y: 30,
        scale: 0.95,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: 'power3.out',
      }
    );

    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [pathname, isClient]);

  // En el servidor, renderizar sin animación
  if (!isClient) {
    return <div>{children}</div>;
  }

  return (
    <div ref={contentRef} className="will-change-transform">
      {children}
    </div>
  );
}
