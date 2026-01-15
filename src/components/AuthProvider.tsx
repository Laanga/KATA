'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('AuthProvider: Auth state changed', { event, hasSession: !!session });
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  return <>{children}</>;
}
