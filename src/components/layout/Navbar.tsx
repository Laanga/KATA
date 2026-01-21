'use client';

import Link from 'next/link';
import { UserAvatar } from './UserAvatar';
import { usePathname } from 'next/navigation';

export function Navbar() {
    const pathname = usePathname();

    const navLinks = [
        { href: '/books', label: 'Libros' },
        { href: '/series', label: 'Series' },
        { href: '/movies', label: 'Películas' },
        { href: '/games', label: 'Juegos' },
        { href: '/library', label: 'Biblioteca' },
        { href: '/discover', label: 'Descubrir' },
    ];

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 h-14 sm:h-16 border-b border-white/10 bg-black/50 backdrop-blur-xl hidden md:flex flex-col">
                <div className="container mx-auto flex h-full items-center justify-between px-4 sm:px-6">
                    {/* Logo / Menu Mobile */}
                    <div className="flex items-center gap-3 sm:gap-4">

                        <Link
                            href="/home"
                            className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5 sm:gap-2"
                        >
                            <span>Kata</span>
                            <span className="font-serif text-[var(--accent-primary)]">型</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.slice(0, 4).map((link) => (
                            <NavLink key={link.href} href={link.href} label={link.label} pathname={pathname} />
                        ))}
                        <div className="h-4 w-px bg-white/10 mx-2"></div>
                        {navLinks.slice(4).map((link) => (
                            <NavLink key={link.href} href={link.href} label={link.label} pathname={pathname} />
                        ))}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        <UserAvatar />
                    </div>
                </div>
            </nav>


        </>
    );
}

function NavLink({ href, label, pathname }: { href: string; label: string; pathname: string }) {
    const isActive = pathname === href;
    
    return (
        <Link
            href={href}
            className={`text-sm font-medium transition-colors ${
                isActive
                    ? 'text-[var(--accent-primary)]'
                    : 'text-[var(--text-secondary)] hover:text-white'
            }`}
        >
            {label}
        </Link>
    );
}
