'use client';

import { Home, Library, Search, User } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/library', label: 'Biblioteca', icon: Library },
    { href: '/search', label: 'Buscar', icon: Search },
    { href: '/profile', label: 'Perfil', icon: User },
  ];

  const isActive = (href: string) => {
    if (href === '/library' && pathname === '/library') return true;
    if (href === '/search' && pathname === '/search') return true;
    if (href === '/') return pathname === '/';
    return pathname === href;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[999] md:hidden bg-[var(--bg-secondary)]/95 backdrop-blur-xl border-t border-white/10 shadow-2xl pb-safe">
      <div className="flex items-center justify-around h-20 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center w-full h-full relative group active:scale-95 transition-transform duration-150"
              aria-label={item.label}
            >
              <div className={`flex items-center justify-center min-h-[48px] min-w-[48px] transition-all duration-200 ${
                active ? 'text-[var(--accent-primary)] scale-105' : 'text-[var(--text-secondary)] group-hover:text-white'
              }`}>
                <Icon
                  className={`w-7 h-7 mb-1 transition-all duration-200 ${active ? 'animate-pulse' : ''}`}
                  strokeWidth={active ? 2.5 : 2}
                />
              </div>
              <span className={`text-[11px] font-medium transition-all duration-200 ${
                active ? 'text-[var(--accent-primary)] font-semibold' : 'text-[var(--text-secondary)]'
              }`}>
                {item.label}
              </span>
              {active && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-[var(--accent-primary)] rounded-full shadow-[0_0_10px_var(--accent-primary)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
