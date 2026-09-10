'use client';
import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';
const trusted = [
  'image.tmdb.org',
  'images.igdb.com',
  'books.google.com',
  'covers.openlibrary.org',
  'media.rawg.io',
  'images-na.ssl-images-amazon.com',
  'm.media-amazon.com',
  'upload.wikimedia.org',
  'lh3.googleusercontent.com',
];
function safeSource(src: ImageProps['src']): ImageProps['src'] {
  if (typeof src !== 'string') return src;
  if (src.startsWith('/') && !src.startsWith('//')) return src;
  try {
    const url = new URL(src);
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      url.origin === new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
    )
      return src;
    if (
      url.protocol === 'https:' &&
      (trusted.includes(url.hostname) || url.hostname.endsWith('.supabase.co'))
    )
      return src;
  } catch {}
  return '/placeholder-cover.svg';
}
function Cover({ src, alt, ...props }: ImageProps) {
  const [failed, setFailed] = useState(false);
  return (
    <Image
      {...props}
      alt={alt}
      src={failed ? '/placeholder-cover.svg' : safeSource(src)}
      onError={() => setFailed(true)}
    />
  );
}
export function MediaCover(props: ImageProps) {
  return <Cover key={String(props.src)} {...props} />;
}
