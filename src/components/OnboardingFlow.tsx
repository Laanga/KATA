'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useMediaStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { CheckCircle, BookOpen, BarChart3, Sparkles } from 'lucide-react';
import { FadeIn } from '@/components/FadeIn';

interface OnboardingProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function Onboarding({ isOpen, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const items = useMediaStore((state) => state.items);
  const setFilters = useMediaStore((state) => state.setFilters);

  const steps = [
    {
      title: '¡Bienvenido a Kata!',
      description: 'Tu biblioteca personal de medios. Organiza, trackea y descubre películas, series, libros y videojuegos en un solo lugar.',
      icon: <Sparkles className="w-16 h-16" />
    },
    {
      title: 'Añade tu primer item',
      description: 'Empieza a trackear tus películas favoritas, libros pendientes o juegos que quieres jugar.',
      icon: <BookOpen className="w-16 h-16" />
    },
    {
      title: 'Explora tu dashboard',
      description: 'Ve estadísticas de tu biblioteca, tus valoraciones medias y actividad reciente.',
      icon: <BarChart3 className="w-16 h-16" />
    }
  ];

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const skipOnboarding = () => {
    localStorage.setItem('kata_onboarding_completed', 'true');
    onComplete();
  };

  const goToLibrary = () => {
    setFilters({ type: 'ALL' });
    router.push('/library');
    onComplete();
  };

  const finishOnboarding = () => {
    localStorage.setItem('kata_onboarding_completed', 'true');
    onComplete();
  };

  return (
    <Modal isOpen={isOpen} onClose={onComplete} size="lg">
      <div className="space-y-8">
        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className="h-1.5 w-8 rounded-full transition-all"
              style={{
                backgroundColor: idx === step ? 'var(--accent-primary)' : 'var(--bg-secondary)',
              }}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="text-center">
          <FadeIn delay={0.1}>
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center mb-6">
                {steps[step].icon}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">
              {steps[step].title}
            </h2>
            <p className="text-[var(--text-secondary)] text-lg text-center max-w-md mx-auto">
              {steps[step].description}
            </p>

            {/* Step 0: Welcome */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="flex justify-center gap-4">
                  <CheckCircle className="w-8 h-8 text-[var(--accent-primary)]" />
                  <div className="text-6xl font-bold text-[var(--accent-primary)]">
                    型
                  </div>
                </div>
                <p className="text-[var(--text-secondary)]">
                  Simplifica tu biblioteca, trackea tu progreso y descubre nuevos títulos.
                </p>
              </div>
            )}

            {/* Step 1: Add First Item */}
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-[var(--text-secondary)]">
                  Actualmente tienes <span className="font-semibold text-white">{items.length} elementos</span> en tu biblioteca.
                </p>
                <div className="flex justify-center gap-4">
                  <Button onClick={goToLibrary}>
                    Ir a Buscar Contenido
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Explore Dashboard */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-[var(--text-secondary)]">
                  Tu dashboard está listo. Explora las métricas de tu biblioteca y visualiza tus estadísticas.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-white/5">
                    <p className="text-sm text-[var(--text-secondary)]">Total</p>
                    <p className="text-3xl font-bold text-white">{items.length}</p>
                  </div>
                  <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-white/5">
                    <p className="text-sm text-[var(--text-secondary)]">Completados</p>
                    <p className="text-3xl font-bold text-[var(--accent-primary)]">
                      {items.filter(i => i.status === 'COMPLETED').length}
                    </p>
                  </div>
                  <div className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-white/5">
                    <p className="text-sm text-[var(--text-secondary)]">Por valorar</p>
                    <p className="text-3xl font-bold text-[var(--accent-warning)]">
                      {items.filter(i => i.rating !== null).length}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </FadeIn>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-white/10">
            <div>
              {step > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 rounded-lg"
                >
                  Atrás
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {step < steps.length - 1 ? (
                <Button
                  onClick={nextStep}
                  className="px-6 py-3 rounded-lg"
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  onClick={finishOnboarding}
                  className="px-6 py-3 rounded-lg bg-[var(--accent-primary)] text-black"
                >
                  Comenzar
                </Button>
              )}
            </div>

            <Button
              variant="ghost"
              onClick={skipOnboarding}
              className="text-[var(--text-tertiary)] hover:text-white"
            >
              Omitir
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
