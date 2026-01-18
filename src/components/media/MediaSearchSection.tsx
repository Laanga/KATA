'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, Plus } from 'lucide-react';
import { MediaType } from '@/types/media';
import toast from 'react-hot-toast';
import { AddItemModal } from './AddItemModal';
import { FadeIn } from '@/components/FadeIn';

interface SearchResult {
    id: string | number;
    title: string;
    year?: number;
    author?: string;
    coverUrl?: string;
    rating?: number;
    overview?: string;
    genres?: string[];
}

interface TMDBMovie {
    id: number;
    title: string;
    release_date: string;
    poster_path: string | null;
    overview: string;
    genre_ids: number[];
    genre_names?: string[];
}

interface TMDBSeries {
    id: number;
    name: string;
    first_air_date: string;
    poster_path: string | null;
    overview: string;
    genre_ids: number[];
    genre_names?: string[];
}

interface IGDBGame {
    id: number;
    name: string;
    first_release_date: number;
    cover?: { url: string };
    summary: string;
    rating: number;
    genres?: Array<{ name: string }>;
}

interface GoogleBookVolume {
    id: string;
    volumeInfo: {
        title: string;
        authors?: string[];
        publishedDate?: string;
        imageLinks?: { thumbnail?: string };
        description?: string;
        genre_names?: string[];
    };
}

interface MediaSearchSectionProps {
    type: MediaType;
    title: string;
    description: string;
}

// Traducción de tipos para el placeholder
const TYPE_SEARCH_LABELS: Record<MediaType, string> = {
    BOOK: 'libro',
    GAME: 'juego',
    MOVIE: 'película',
    SERIES: 'serie',
};

export function MediaSearchSection({ type, title, description }: MediaSearchSectionProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleSearch = useCallback(async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setSearchResults([]);

        try {
            let endpoint = '';
            switch (type) {
                case 'MOVIE': endpoint = '/api/search/movies'; break;
                case 'SERIES': endpoint = '/api/search/series'; break;
                case 'GAME': endpoint = '/api/search/games'; break;
                case 'BOOK': endpoint = '/api/search/books'; break;
            }

            const res = await fetch(`${endpoint}?q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();

            if (data.error) {
                console.warn('Search API error:', data.error);
                return;
            }

            let mappedResults: SearchResult[] = [];

            if (type === 'MOVIE') {
                mappedResults = (data.results || []).map((item: TMDBMovie) => ({
                    id: item.id,
                    title: item.title,
                    year: item.release_date ? parseInt(item.release_date.split('-')[0]) : undefined,
                    coverUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : undefined,
                    overview: item.overview,
                    genres: item.genre_names || []
                }));
            } else if (type === 'SERIES') {
                mappedResults = (data.results || []).map((item: TMDBSeries) => ({
                    id: item.id,
                    title: item.name,
                    year: item.first_air_date ? parseInt(item.first_air_date.split('-')[0]) : undefined,
                    coverUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : undefined,
                    overview: item.overview,
                    genres: item.genre_names || []
                }));
            } else if (type === 'GAME') {
                mappedResults = (Array.isArray(data) ? data : []).map((item: IGDBGame) => ({
                    id: item.id,
                    title: item.name,
                    year: item.first_release_date ? new Date(item.first_release_date * 1000).getFullYear() : undefined,
                    coverUrl: item.cover?.url ? `https:${item.cover.url.replace('t_thumb', 't_cover_big')}` : undefined,
                    overview: item.summary,
                    genres: item.genres?.map((g) => g.name).filter(Boolean) || []
                }));
            } else if (type === 'BOOK') {
                mappedResults = (data.items || []).map((item: GoogleBookVolume) => ({
                    id: item.id,
                    title: item.volumeInfo.title,
                    author: item.volumeInfo.authors?.[0],
                    year: item.volumeInfo.publishedDate ? parseInt(item.volumeInfo.publishedDate.split('-')[0]) : undefined,
                    coverUrl: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:'),
                    overview: item.volumeInfo.description,
                    genres: item.volumeInfo.genre_names || []
                }));
            }

            setSearchResults(mappedResults.slice(0, 12));
        } catch (error) {
            console.error('Search failed', error);
            toast.error('Error al buscar elementos');
        } finally {
            setIsSearching(false);
        }
    }, [searchQuery, type]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.length >= 2) {
                handleSearch();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, handleSearch]);

    const handleSelectResult = (result: SearchResult) => {
        setSelectedResult(result);
        setIsAddModalOpen(true);
    };

    return (
        <div className="space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
                <p className="text-[var(--text-secondary)] max-w-lg mx-auto">{description}</p>

                <div className="relative max-w-2xl mx-auto mt-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={`Buscar ${TYPE_SEARCH_LABELS[type]}...`}
                        className="w-full rounded-2xl border border-white/10 bg-[var(--bg-secondary)] pl-12 pr-6 py-4 text-lg text-white placeholder-[var(--text-tertiary)] shadow-lg focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
                        autoFocus
                    />
                    {isSearching && (
                        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[var(--text-tertiary)]" size={20} />
                    )}
                </div>
            </div>

            {/* Results Grid */}
            {searchResults.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                    {searchResults.map((result, index) => (
                        <FadeIn key={result.id} delay={index * 0.05}>
                            <button
                                onClick={() => handleSelectResult(result)}
                                className="group w-full text-left relative aspect-[2/3] rounded-xl overflow-hidden bg-[var(--bg-secondary)] border border-white/5 hover:border-[var(--accent-primary)] transition-all hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                            >
                                {result.coverUrl ? (
                                    <img
                                        src={result.coverUrl}
                                        alt={result.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                                        <span className="text-4xl mb-2">?</span>
                                        <span className="text-xs text-[var(--text-tertiary)]">Sin Portada</span>
                                    </div>
                                )}

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                    <h3 className="font-bold text-white leading-tight line-clamp-2">{result.title}</h3>
                                    <p className="text-sm text-[var(--accent-primary)] mt-1">
                                        {result.year}
                                        {result.author && ` • ${result.author}`}
                                    </p>
                                    {result.genres && result.genres.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {result.genres.slice(0, 2).map((genre, idx) => (
                                                <span 
                                                    key={idx}
                                                    className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white/90 backdrop-blur-sm"
                                                >
                                                    {genre}
                                                </span>
                                            ))}
                                            {result.genres.length > 2 && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white/90 backdrop-blur-sm">
                                                    +{result.genres.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    <div className="mt-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/80">
                                        <Plus size={14} />
                                        Añadir a Biblioteca
                                    </div>
                                </div>
                            </button>
                        </FadeIn>
                    ))}
                </div>
            )}

            {searchQuery.length > 2 && searchResults.length === 0 && !isSearching && (
                <div className="text-center py-20">
                    <p className="text-[var(--text-tertiary)] text-lg">No se encontraron resultados para &quot;{searchQuery}&quot;</p>
                </div>
            )}

            {/* Add Modal populated with selection */}
            {selectedResult && (
                <AddItemModal
                    isOpen={isAddModalOpen}
                    onClose={() => {
                        setIsAddModalOpen(false);
                        setSelectedResult(null);
                    }}
                    prefilledType={type}
                    initialData={{
                        title: selectedResult.title,
                        coverUrl: selectedResult.coverUrl,
                        releaseYear: selectedResult.year,
                        author: selectedResult.author,
                        genres: selectedResult.genres || [],
                    }}
                />
            )}
        </div>
    );
}
