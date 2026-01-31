'use client';

import { Home, Library, Search, User, Compass, ChevronUp, ChevronDown } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

const allowedRoutes = [
  '/home',
  '/library',
  '/books',
  '/movies',
  '/series',
  '/games',
  '/search',
  '/discover',
  '/profile',
];

export default function BottomNavigation() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!allowedRoutes.includes(pathname)) {
    return null;
  }

  const navItems = [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/library', label: 'Biblioteca', icon: Library },
    { href: '/search', label: 'Buscar', icon: Search },
    { href: '/discover', label: 'Descubrir', icon: Compass },
    { href: '/profile', label: 'Perfil', icon: User },
  ];

  const isActive = (href: string) => {
    return pathname === href;
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      <nav 
        className={`fixed bottom-0 left-0 right-0 z-[9999] md:hidden transition-all duration-300 ease-out ${
          isCollapsed ? 'translate-y-[52px]' : 'translate-y-0'
        }`}
        style={{
          background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.85) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          <div className={`flex items-center justify-center gap-1 overflow-x-auto scrollbar-hide px-2 transition-all duration-300 ${
            isCollapsed ? 'h-[60px]' : 'h-[80px]'
          }`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center w-20 flex-shrink-0 h-full relative group active:scale-95 transition-transform duration-150"
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
                  {!isCollapsed && (
                    <span className={`text-[11px] font-medium transition-all duration-300 ${
                      active ? 'text-[var(--accent-primary)] font-semibold' : 'text-[var(--text-secondary)]'
                    }`}>
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <button
            onClick={toggleCollapse}
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full px-3 py-1 rounded-t-lg bg-[var(--accent-primary)]/10 hover:bg-[var(--accent-primary)]/20 backdrop-blur-sm border border-t border-x border-[var(--accent-primary)]/20 border-b-0 transition-all"
            aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
          >
            {isCollapsed ? (
              <ChevronUp className="w-4 h-4 text-[var(--accent-primary)]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />
            )}
          </button>
        </div>
      </nav>

      <div className={`fixed bottom-0 left-0 right-0 z-[9998] md:hidden pointer-events-none transition-opacity duration-300 ${
        isCollapsed ? 'opacity-0' : 'opacity-100'
      }`}>
        <div className="h-[80px] bg-gradient-to-t from-black/20 to-transparent" />
      </div>
    </>
  );
}
