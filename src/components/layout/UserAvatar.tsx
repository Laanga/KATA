'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function UserAvatar() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAvatarUrl(user.user_metadata?.avatar_url || null);
      }
      setIsLoading(false);
    };
    getUser();
  }, []);

  return (
    <Link
      href="/profile"
      className="h-8 w-8 rounded-full bg-gradient-to-tr from-[var(--accent-primary)] to-emerald-900 flex items-center justify-center border border-white/10 hover:border-[var(--accent-primary)] transition-colors overflow-hidden"
    >
      {isLoading ? (
        <div className="w-full h-full bg-white/10 animate-pulse" />
      ) : avatarUrl && !imageError ? (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <User size={16} className="text-white" />
      )}
    </Link>
  );
}
