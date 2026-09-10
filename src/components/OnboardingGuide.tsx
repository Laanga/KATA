'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Film, Tv, Gamepad2, ArrowRight, Check } from 'lucide-react';
import { track } from '@vercel/analytics';
import { Modal } from '@/components/ui/Modal';
import { RadioChoice } from '@/components/ui/Choice';
import { Panel } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { MediaCover } from '@/components/media/MediaCover';
import { useMediaStore } from '@/lib/store';
import { STATUS_LABELS } from '@/lib/utils/constants';
import type { UserPreferences } from '@/types/supabase';
import type { MediaType } from '@/types/media';

export const welcomeCategories = [
  { type: 'MOVIE', label: 'Películas', icon: Film },
  { type: 'SERIES', label: 'Series', icon: Tv },
  { type: 'BOOK', label: 'Libros', icon: BookOpen },
  { type: 'GAME', label: 'Juegos', icon: Gamepad2 },
] as const;

type Changes = Partial<Omit<UserPreferences, 'user_id' | 'updated_at'>>;
export function OnboardingGuide({
  preferences,
  save,
}: {
  preferences: UserPreferences;
  save: (changes: Changes) => Promise<void>;
}) {
  const [type, setType] = useState<MediaType>(preferences.preferred_type || 'MOVIE');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const locked = useRef(false);
  const router = useRouter();
  const firstItem = useMediaStore((s) =>
    s.items.find((item) => item.id === preferences.first_item_id),
  );
  const step = preferences.onboarding_step;
  useEffect(() => {
    track('onboarding_viewed', { step });
  }, [step]);
  const perform = async (action: () => Promise<void>) => {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos guardar. Inténtalo de nuevo.');
    } finally {
      locked.current = false;
      setBusy(false);
    }
  };
  const skip = () =>
    perform(async () => {
      await save({ onboarding_status: 'skipped', finished_at: new Date().toISOString() });
      track('onboarding_skipped', { step });
    });
  const finish = (path = '/library') =>
    perform(async () => {
      await save({
        onboarding_status: 'completed',
        onboarding_step: 3,
        finished_at: new Date().toISOString(),
      });
      useMediaStore.getState().resetFilters();
      useMediaStore.getState().setSearchQuery('');
      track('onboarding_completed');
      router.replace(path);
    });
  return (
    <Modal
      isOpen
      onClose={() => (step === 3 ? void finish() : void skip())}
      title={step === 3 ? 'Guardado en tu biblioteca' : 'Bienvenido a Kata'}
      size="md"
    >
      <div className="space-y-5">
        <div
          className="flex items-center gap-2 text-xs text-[var(--text-secondary)]"
          aria-label={`Paso ${step} de 3`}
        >
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              aria-hidden="true"
              className={`h-1 w-8 rounded-full ${n <= step ? 'bg-emerald-400' : 'bg-white/10'}`}
            />
          ))}
          <span className="ml-2">
            {step} de 3 · {step === 3 ? 'Todo listo' : 'A tu ritmo'}
          </span>
        </div>
        {step === 1 ? (
          <>
            <div>
              <h3 className="kata-title-section">
                Que tu próxima historia
                <br />
                no se te escape.
              </h3>
              <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                Ese libro pendiente, la serie que te recomendaron… Guárdalos aquí y vuelve cuando te
                apetezca.
              </p>
            </div>
            <fieldset>
              <legend className="text-sm font-medium mb-3">¿Con qué te apetece empezar?</legend>
              <div className="grid grid-cols-2 gap-2">
                {welcomeCategories.map(({ type: value, label, icon: Icon }) => (
                  <RadioChoice
                    key={value}
                    name="welcome-category"
                    value={value}
                    checked={type === value}
                    onChange={() => setType(value)}
                    disabled={busy}
                  >
                    <Icon
                      size={20}
                      className={
                        type === value ? 'text-emerald-300' : 'text-[var(--text-secondary)]'
                      }
                    />
                    <span className="text-sm">{label}</span>
                  </RadioChoice>
                ))}
              </div>
            </fieldset>
            <div className="space-y-3">
              <Button
                className="w-full"
                size="lg"
                isLoading={busy}
                onClick={() =>
                  perform(async () => {
                    await save({
                      onboarding_status: 'in_progress',
                      onboarding_step: 2,
                      preferred_type: type,
                      finished_at: null,
                    });
                    track('onboarding_step_completed', { step: 1, type });
                    router.replace('/search');
                  })
                }
              >
                Vamos a buscar <ArrowRight size={18} />
              </Button>
              <p className="text-center text-xs text-[var(--text-secondary)]">
                Solo un título para empezar. El resto, cuando quieras.
              </p>
            </div>
            <Button variant="ghost" disabled={busy} onClick={skip} className="w-full">
              Ahora no
            </Button>
          </>
        ) : (
          <>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
              <Check size={26} />
            </div>
            <div>
              <h3 className="kata-title-section">Ya tienes dónde volver.</h3>
              <p className="mt-3 text-[var(--text-secondary)]">
                Tu primer título ya está a salvo en tu biblioteca.
              </p>
            </div>
            {firstItem && (
              <Panel tone="subtle" className="flex gap-4 items-center">
                <MediaCover
                  src={firstItem.coverUrl}
                  alt=""
                  width={52}
                  height={78}
                  className="rounded-lg object-cover h-[78px] w-[52px]"
                />
                <div>
                  <p className="font-medium line-clamp-2">{firstItem.title}</p>
                  <p className="mt-1 text-sm text-emerald-300">{STATUS_LABELS[firstItem.status]}</p>
                </div>
              </Panel>
            )}
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Cuando avances, toca <span className="text-white font-medium">Editar</span> para
              cambiar su estado. Así recordarás siempre por dónde vas.
            </p>
            <div className="space-y-2">
              <Button className="w-full" size="lg" isLoading={busy} onClick={() => finish()}>
                Ver mi biblioteca <ArrowRight size={18} />
              </Button>
              <Button
                className="w-full"
                variant="ghost"
                disabled={busy}
                onClick={() => finish('/search')}
              >
                Buscar otro título
              </Button>
            </div>
          </>
        )}
        {error && (
          <p role="alert" className="kata-notice kata-notice--error">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
