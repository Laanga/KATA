'use client';

import Link from 'next/link';
import { UserAvatar } from './UserAvatar';
import { usePathname } from 'next/navigation';

const ALLOWED_ROUTES = ['/home', '/library', '/search', '/discover', '/profile'];

export function Navbar() {
  const pathname = usePathname();

  const isAllowed = ALLOWED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
  if (!isAllowed) return null;

  const navLinks = [
    { href: '/home', label: 'Inicio' },
    { href: '/search', label: 'Buscar' },
    { href: '/library', label: 'Biblioteca' },
    { href: '/discover', label: 'Descubrir' },
  ];

  return (
    <>
      {/* Logo - top left */}
      <Link
        href="/home"
        aria-label="Kata - Inicio"
        className="hidden md:flex fixed top-5 left-6 z-50 items-center gap-1.5 text-lg font-bold tracking-tight text-white transition-opacity hover:opacity-80"
      >
        <span>Kata</span>
        <span className="font-serif text-[var(--accent-primary)]">型</span>
      </Link>

      {/* Floating pill nav - top center */}
      <nav
        aria-label="Navegación principal"
        className="hidden md:block fixed top-3 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="liquid-glass relative flex items-center gap-0.5 px-2 py-1.5 rounded-full border border-white/10">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              isActive={pathname === link.href || pathname.startsWith(`${link.href}/`)}
            />
          ))}
        </div>
      </nav>

      {/* Avatar - top right */}
      <div className="hidden md:block fixed top-4 right-6 z-50">
        <UserAvatar />
      </div>
    </>
  );
}

function NavLink({ href, label, isActive }: { href: string; label: string; isActive: boolean }) {
  return (
    <Link href={href} className="kata-nav-link" aria-current={isActive ? 'page' : undefined}>
      {label}
    </Link>
  );
}
