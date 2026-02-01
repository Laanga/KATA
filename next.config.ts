import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from "next/constants";
import withPWA from "@ducanh2912/next-pwa";

const isDevelopment = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  turbopack: {}, // Silenciar warning de Turbopack, usamos webpack para PWA
  images: {
    remotePatterns: [
      // APIs de medios
      { protocol: 'https', hostname: 'image.tmdb.org' },
      { protocol: 'https', hostname: 'images.igdb.com' },
      { protocol: 'https', hostname: 'books.google.com' },
      { protocol: 'https', hostname: 'covers.openlibrary.org' },
      { protocol: 'https', hostname: 'media.rawg.io' },
      // Supabase Storage (para avatares)
      { protocol: 'https', hostname: '*.supabase.co' },
      // Otras fuentes de imágenes
      { protocol: 'https', hostname: 'images-na.ssl-images-amazon.com' },
      { protocol: 'https', hostname: 'm.media-amazon.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      // Google user content (avatares de Google OAuth)
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: isDevelopment
              ? 'max-age=300'
              : 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
            {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https://image.tmdb.org https://images.igdb.com https://books.google.com https://covers.openlibrary.org https://media.rawg.io https://*.supabase.co https://images-na.ssl-images-amazon.com https://m.media-amazon.com https://upload.wikimedia.org https://lh3.googleusercontent.com",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co https://api.themoviedb.org https://api.rawg.io https://api.igdb.com https://openlibrary.org https://*.vercel-analytics.com https://image.tmdb.org https://images.igdb.com https://books.google.com https://covers.openlibrary.org https://media.rawg.io https://lh3.googleusercontent.com",
              "frame-src 'none'",
              "form-action 'self'",
              "base-uri 'self'",
              "manifest-src 'self'",
              "worker-src 'self' blob:",
            ].join('; ')
          },
        ],
      },
    ];
  },
};

// PWA configuration
export default (phase: string) => {
  // Only enable PWA in production builds
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return nextConfig;
  }

  const pwaConfig = withPWA({
    dest: "public",
    disable: false,
    register: true,
    extendDefaultRuntimeCaching: true,
    workboxOptions: {
      skipWaiting: true,
      clientsClaim: true,
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/image\.tmdb\.org\/.*/i,
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "tmdb-images",
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 48,
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
            fetchOptions: {
              credentials: "omit",
            },
          },
        },
        {
          urlPattern: /^https:\/\/images\.igdb\.com\/.*/i,
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "igdb-images",
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 48,
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
            fetchOptions: {
              credentials: "omit",
            },
          },
        },
        {
          urlPattern: /^https:\/\/media\.rawg\.io\/.*/i,
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "rawg-images",
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 48,
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
            fetchOptions: {
              credentials: "omit",
            },
          },
        },
        {
          urlPattern: /^https:\/\/books\.google\.com\/.*/i,
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "google-books-images",
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 48,
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
            fetchOptions: {
              credentials: "omit",
            },
          },
        },
        {
          urlPattern: /^https:\/\/covers\.openlibrary\.org\/.*/i,
          handler: "StaleWhileRevalidate",
          options: {
            cacheName: "openlibrary-images",
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 48,
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
            fetchOptions: {
              credentials: "omit",
            },
          },
        },
      ],
    },
  })(nextConfig);

  return pwaConfig;
};
