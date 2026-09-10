'use client';

import { Home, Library, Search, User, Compass } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * Mide cuánto tapa la UI del navegador (toolbar inferior de Brave/Safari,
 * teclado…) la parte baja del layout viewport. env(safe-area-inset-bottom)
 * no cubre este caso: las toolbars del navegador no cuentan como safe area.
 */
function useBrowserUiOffset() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      const overlap = window.innerHeight - vv.height - vv.offsetTop;
      setOffset(overlap > 0 ? Math.round(overlap) : 0);
    };

    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  return offset;
}

const navItems = [
  { href: '/home', label: 'Inicio', icon: Home },
  { href: '/library', label: 'Biblioteca', icon: Library },
  { href: '/search', label: 'Buscar', icon: Search },
  { href: '/discover', label: 'Descubrir', icon: Compass },
  { href: '/profile', label: 'Perfil', icon: User },
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const browserUiOffset = useBrowserUiOffset();

  const isAllowed = navItems.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  if (!isAllowed) return null;

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed left-1/2 -translate-x-1/2 z-40 md:hidden transition-[bottom] duration-200"
      style={{
        bottom: `calc(0.75rem + env(safe-area-inset-bottom, 0px) + ${browserUiOffset}px)`,
      }}
    >
      <div className="liquid-glass flex items-center gap-0.5 px-1.5 py-1.5 rounded-full border border-white/10">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[52px] px-1 rounded-full transition-all duration-200 active:scale-90 ${
                active
                  ? 'liquid-glass-active text-[var(--accent-primary)]'
                  : 'text-[var(--text-secondary)]'
              }`}
            >
              <Icon
                className={`w-[22px] h-[22px] transition-transform duration-200 ${
                  active ? 'scale-105' : ''
                }`}
                strokeWidth={active ? 2.4 : 2}
              />
              <span
                className={`text-[10px] leading-tight mt-0.5 font-medium ${
                  active ? 'text-[var(--accent-primary)]' : 'text-[var(--text-tertiary)]'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
