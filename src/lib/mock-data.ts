// Definición del tipo de elemento de media
export type MediaType = 'BOOK' | 'GAME' | 'MOVIE' | 'SERIES';
export type MediaStatus = 'COMPLETED' | 'PLAYING' | 'WATCHING';

export interface MediaItem {
    id: string;
    title: string;
    type: MediaType;
    coverUrl: string;
    rating: number;
    status: MediaStatus;
}

export const MOCK_MEDIA_ITEMS: readonly MediaItem[] = [
    {
        id: '1',
        title: 'Dune',
        type: 'BOOK',
        coverUrl: 'https://www.impawards.com/2021/posters/dune_ver2_xlg.jpg',
        rating: 9.5,
        status: 'COMPLETED',
    },
    {
        id: '2',
        title: 'Elden Ring',
        type: 'GAME',
        coverUrl: 'https://image.api.playstation.com/vulcan/ap/rnd/202110/2000/phvVT0qZfcRms5qDAk0SI3CM.png',
        rating: 10,
        status: 'PLAYING',
    },
    {
        id: '3',
        title: 'Oppenheimer',
        type: 'MOVIE',
        coverUrl: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
        rating: 8.8,
        status: 'WATCHING',
    },
    {
        id: '4',
        title: 'Succession',
        type: 'SERIES',
        coverUrl: 'https://image.tmdb.org/t/p/w500/7T5xXfF8jW8uN13W1F5W2J7u3w.jpg',
        rating: 9.2,
        status: 'COMPLETED',
    },
    {
        id: '5',
        title: 'The Legend of Zelda: Breath of the Wild',
        type: 'GAME',
        coverUrl: 'https://upload.wikimedia.org/wikipedia/en/0/0d/The_Legend_of_Zelda_Breath_of_the_Wild.jpg',
        rating: 9.8,
        status: 'COMPLETED',
    },
    {
        id: '6',
        title: 'Blade Runner 2049',
        type: 'MOVIE',
        coverUrl: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
        rating: 9.0,
        status: 'COMPLETED',
    },
    {
        id: '7',
        title: 'Interstellar',
        type: 'MOVIE',
        coverUrl: 'https://m.media-amazon.com/images/I/91kFYg4fX3L._AC_UF894,1000_QL80_.jpg',
        rating: 8.7,
        status: 'COMPLETED',
    },
    {
        id: '8',
        title: 'The Office',
        type: 'SERIES',
        coverUrl: 'https://m.media-amazon.com/images/I/71lGhXgYIQL._AC_SY679_.jpg',
        rating: 8.9,
        status: 'COMPLETED',
    },
];
