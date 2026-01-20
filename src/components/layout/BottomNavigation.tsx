'use client';

import { Home, Library, Search, User } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const allowedRoutes = [
  '/home',
  '/library',
  '/books',
  '/movies',
  '/series',
  '/games',
  '/search',
  '/profile',
];

export default function BottomNavigation() {
  const pathname = usePathname();

  if (!allowedRoutes.includes(pathname)) {
    return null;
  }

  const navItems = [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/library', label: 'Biblioteca', icon: Library },
    { href: '/search', label: 'Buscar', icon: Search },
    { href: '/profile', label: 'Perfil', icon: User },
  ];

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[9999] md:hidden bg-[var(--bg-secondary)]/85 backdrop-blur-3xl border-t border-white/5 rounded-t-3xl shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.3),0_0_40px_-4px_rgba(16,185,129,0.1)] pb-safe relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[var(--accent-primary)]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <div className="relative h-[80px] pb-safe">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-t-3xl" />
        <div className="relative flex items-center justify-around h-full px-2">
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
                {active && (
                  <>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-[var(--accent-primary)]/20 rounded-full blur-xl -translate-y-4" />
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-[var(--accent-primary)] rounded-full shadow-[0_0_10px_var(--accent-primary)]" />
                  </>
                )}
                <div className={`flex items-center justify-center min-h-[48px] min-w-[48px] transition-all duration-300 ease-out ${
                  active ? 'text-[var(--accent-primary)] scale-110' : 'text-[var(--text-secondary)] group-hover:text-white'
                }`}>
                  <Icon
                    className={`w-7 h-7 mb-1 transition-all duration-300 ${active ? 'animate-pulse drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''}`}
                    strokeWidth={active ? 2.5 : 2}
                  />
                </div>
                <span className={`text-[11px] font-medium transition-all duration-300 ${
                  active ? 'text-[var(--accent-primary)] font-semibold' : 'text-[var(--text-secondary)]'
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
