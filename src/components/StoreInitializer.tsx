'use client';

import { useEffect } from 'react';
import { useMediaStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';

export function StoreInitializer() {
  const initialize = useMediaStore((state) => state.initialize);

  useEffect(() => {
    let isMounted = true;

    const checkAndInitialize = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (!isMounted) return;

        // Only initialize if user exists and has valid session
        if (user && !error) {
          const emailConfirmed = user.email_confirmed_at !== null;
          const hasUsername = user.user_metadata?.username;

          // Only initialize store if user is fully authenticated
          if (emailConfirmed && hasUsername) {
            await initialize();
          }
        }
      } catch {
        // Silently fail - auth is handled by AuthProvider
      }
    };

    checkAndInitialize();

    return () => {
      isMounted = false;
    };
  }, [initialize]);

  // Render nothing - this is purely for side effects
  return null;
}
