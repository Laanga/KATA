'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useMediaStore } from '@/lib/store';
import { usePathname, useRouter } from 'next/navigation';

const AuthContext = createContext<{ user: User | null; loading: boolean }>({
  user: null,
  loading: true,
});
export const useAuth = () => useContext(AuthContext);
const privateRoutes = ['/home', '/library', '/search', '/discover', '/profile', '/onboarding'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    const supabase = createClient();
    let active = true;
    let revision = 0;
    const sync = (next: User | null) => {
      if (!active) return;
      if (useMediaStore.getState().userId !== (next?.id ?? null))
        useMediaStore.getState().reset(next?.id ?? null);
      setUser(next);
      setLoading(false);
    };
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return;
      revision++;
      sync(session?.user ?? null);
    });
    const initialRevision = revision;
    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (revision === initialRevision) sync(data.user);
      })
      .catch(() => {
        if (revision === initialRevision) sync(null);
      });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading || !privateRoutes.some((p) => pathname === p || pathname.startsWith(p + '/')))
      return;
    if (!user) router.replace('/login');
    else if (!user.email_confirmed_at) router.replace('/verify-email');
    else if (!user.user_metadata?.username) router.replace('/choose-username');
  }, [user, loading, pathname, router]);
  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}
