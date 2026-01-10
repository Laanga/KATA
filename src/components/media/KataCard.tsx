'use client';

import Image from 'next/image';
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Heart, Star, MoreVertical } from 'lucide-react';

interface KataCardProps {
    title: string;
    type: 'BOOK' | 'GAME' | 'MOVIE' | 'SERIES';
    coverUrl: string;
    rating?: number;
    status?: string;
}

export function KataCard({ title, type, coverUrl, rating = 0 }: KataCardProps) {
    const container = useRef<HTMLDivElement>(null);
    const overlay = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        // Hover animation
        const tl = gsap.timeline({ paused: true });

        tl.to(overlay.current, {
            opacity: 1,
            duration: 0.2,
            ease: 'power2.out'
        })
            .to('.card-actions', {
                y: 0,
                opacity: 1,
                duration: 0.2,
                stagger: 0.05
            }, '<');

        container.current?.addEventListener('mouseenter', () => tl.play());
        container.current?.addEventListener('mouseleave', () => tl.reverse());

    }, { scope: container });

    const getTypeColor = (t: string) => {
        switch (t) {
            case 'BOOK': return 'var(--color-book)';
            case 'GAME': return 'var(--color-game)';
            case 'MOVIE': return 'var(--color-movie)';
            case 'SERIES': return 'var(--color-series)';
            default: return 'var(--accent-primary)';
        }
    };

    return (
        <div
            ref={container}
            className="group relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-[var(--bg-secondary)] shadow-lg transition-transform hover:-translate-y-1"
        >
            {/* Cover Image */}
            <Image
                src={coverUrl}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />

            {/* Type Indicator */}
            <div
                className="absolute top-2 right-2 h-2 w-2 rounded-full shadow-sm"
                style={{ backgroundColor: getTypeColor(type) }}
            />

            {/* Hover Overlay */}
            <div
                ref={overlay}
                className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 opacity-0"
            >
                <h3 className="line-clamp-2 font-bold text-white leading-tight mb-1">
                    {title}
                </h3>

                <div className="flex items-center gap-1 text-[var(--accent-warning)] mb-3">
                    <Star size={14} fill="currentColor" />
                    <span className="text-sm font-medium">{rating > 0 ? rating : '-'}</span>
                </div>

                <div className="flex items-center justify-between card-actions translate-y-2 opacity-0">
                    <button className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors">
                        <Heart size={16} />
                    </button>
                    <button className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors">
                        <MoreVertical size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
