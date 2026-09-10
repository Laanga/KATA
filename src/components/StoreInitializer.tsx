'use client';
import { useEffect } from 'react';
import { useMediaStore } from '@/lib/store';
import { useAuth } from './AuthProvider';
export function StoreInitializer() {
  const { user } = useAuth();
  const initialize = useMediaStore((s) => s.initialize);
  useEffect(() => {
    if (user?.email_confirmed_at && user.user_metadata?.username) {
      void initialize().catch(() => {
        /* DataBoundary renders a recoverable error. */
      });
    }
  }, [user?.id, user?.email_confirmed_at, user?.user_metadata?.username, initialize]);
  return null;
}
