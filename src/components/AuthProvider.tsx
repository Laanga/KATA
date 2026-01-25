'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, _session) => {
        // Auth state listener activo
        // Se puede usar para sincronizar estado si es necesario
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  return <>{children}</>;
}
