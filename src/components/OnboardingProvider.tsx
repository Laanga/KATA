'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { createClient } from '@/lib/supabase/client';
import { parsePreferences, type UserPreferences } from '@/types/supabase';
import { useMediaStore } from '@/lib/store';
import { OnboardingGuide } from './OnboardingGuide';
import { Button } from './ui/Button';
type Changes = Partial<Omit<UserPreferences, 'user_id' | 'updated_at'>>;
const Context = createContext<{
  preferences: UserPreferences | null;
  save: (changes: Changes) => Promise<void>;
}>({
  preferences: null,
  save: async () => {
    throw new Error('Preferencias no disponibles');
  },
});
export const useOnboarding = () => useContext(Context);
const privatePaths = ['/home', '/library', '/search', '/discover', '/profile', '/onboarding'];
export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return <UserOnboarding key={user?.id || 'anonymous'}>{children}</UserOnboarding>;
}
function UserOnboarding({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const ready = !!user?.email_confirmed_at && !!user?.user_metadata?.username;
  useEffect(() => {
    let active = true;
    if (!user || !ready) return;
    const client = createClient();
    (async () => {
      const { data, error } = await client
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      if (data) return data;
      const { error: insertError } = await client
        .from('user_preferences')
        .upsert({ user_id: user.id }, { onConflict: 'user_id', ignoreDuplicates: true });
      if (insertError) throw insertError;
      const result = await client
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (result.error) throw result.error;
      return result.data;
    })()
      .then((data) => {
        if (active) setPreferences(parsePreferences(data));
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [user, ready, attempt]);
  const save = useCallback(
    async (changes: Changes) => {
      if (!user) throw new Error('Inicia sesión para continuar');
      const { data, error } = await createClient()
        .from('user_preferences')
        .update(changes)
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) throw new Error('No pudimos guardar tu progreso. Inténtalo de nuevo.');
      if (useMediaStore.getState().userId === user.id) setPreferences(parsePreferences(data));
    },
    [user],
  );
  const privatePage = privatePaths.includes(pathname);
  if (privatePage && ready && error)
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <div role="alert" className="max-w-md text-center space-y-4">
          <h1 className="text-xl font-semibold">No pudimos cargar tus preferencias</h1>
          <p>Tu biblioteca sigue guardada. Vuelve a intentarlo.</p>
          <Button
            onClick={() => {
              setError(false);
              setAttempt((n) => n + 1);
            }}
          >
            Reintentar
          </Button>
          <Button
            variant="ghost"
            onClick={async () => {
              const { error } = await createClient().auth.signOut({ scope: 'local' });
              if (!error) router.replace('/login');
            }}
          >
            Volver a iniciar sesión
          </Button>
        </div>
      </main>
    );
  if (privatePage && (authLoading || !ready || !preferences))
    return (
      <main className="min-h-screen grid place-items-center" role="status">
        Preparando tu biblioteca…
      </main>
    );
  const active =
    preferences?.onboarding_status === 'pending' ||
    preferences?.onboarding_status === 'in_progress';
  const showGuide =
    privatePage &&
    pathname !== '/onboarding' &&
    active &&
    (preferences?.onboarding_step === 1 ||
      (preferences?.onboarding_step === 3 && pathname === '/library'));
  return (
    <Context.Provider value={{ preferences, save }}>
      {children}
      {showGuide && preferences && (
        <OnboardingGuide
          key={`${user?.id}-${preferences.onboarding_step}`}
          preferences={preferences}
          save={save}
        />
      )}
    </Context.Provider>
  );
}
