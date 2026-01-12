import Link from 'next/link';
import { Menu } from 'lucide-react';
import { UserAvatar } from './UserAvatar';

export function Navbar() {

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/10 bg-black/50 backdrop-blur-xl">
                <div className="container mx-auto flex h-full items-center justify-between px-4">
                    {/* Logo / Menu Mobile */}
                    <div className="flex items-center gap-4">
                        <button className="md:hidden text-[var(--text-secondary)] hover:text-white transition-colors">
                            <Menu size={24} />
                        </button>
                        <Link href="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                            <span>Kata</span><span className="font-serif text-[var(--accent-primary)]">型</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        <NavLink href="/books" label="Libros" />
                        <NavLink href="/series" label="Series" />
                        <NavLink href="/movies" label="Películas" />
                        <NavLink href="/games" label="Juegos" />
                        <div className="h-4 w-px bg-white/10 mx-2"></div>
                        <NavLink href="/library" label="Biblioteca" />
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        <UserAvatar />
                    </div>
                </div>
            </nav>
        </>
    );
}

function NavLink({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className="text-sm font-medium text-[var(--text-secondary)] hover:text-white transition-colors"
        >
            {label}
        </Link>
    );
}
