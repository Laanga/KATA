import Link from 'next/link';
import { Menu, Search, User } from 'lucide-react';

export function Navbar() {
    return (
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
                    <NavLink href="/books" label="Books" />
                    <NavLink href="/series" label="Series" />
                    <NavLink href="/movies" label="Movies" />
                    <NavLink href="/games" label="Games" />
                    <div className="h-4 w-px bg-white/10 mx-2"></div>
                    <NavLink href="/library" label="Library" />
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <Link href="/search" className="text-[var(--text-secondary)] hover:text-white transition-colors p-2">
                        <Search size={20} />
                    </Link>
                    <Link href="/profile" className="h-8 w-8 rounded-full bg-gradient-to-tr from-[var(--accent-primary)] to-emerald-900 flex items-center justify-center border border-white/10 hover:border-[var(--accent-primary)] transition-colors">
                        <User size={16} className="text-white" />
                    </Link>
                </div>
            </div>
        </nav>
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
