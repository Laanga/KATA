'use client';

import { useAuth } from '@/components/AuthProvider';
import { MediaCover } from '@/components/media/MediaCover';
import Link from 'next/link';
import { User } from 'lucide-react';

export function UserAvatar() {
  const { user, loading: isLoading } = useAuth();
  const avatarUrl = user?.user_metadata?.avatar_url;
  return (
    <Link
      href="/profile"
      aria-label="Mi perfil"
      className="h-8 w-8 rounded-full bg-gradient-to-tr from-[var(--accent-primary)] to-emerald-900 flex items-center justify-center border border-white/10 hover:border-[var(--accent-primary)] transition-colors overflow-hidden"
    >
      {isLoading ? (
        <div className="w-full h-full bg-white/10 animate-pulse" />
      ) : avatarUrl ? (
        <MediaCover
          width={32}
          height={32}
          src={avatarUrl}
          alt="Avatar"
          className="w-full h-full object-cover"
        />
      ) : (
        <User size={16} className="text-white" />
      )}
    </Link>
  );
}
