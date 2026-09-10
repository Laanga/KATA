'use client';
import { TextInput } from '@/components/ui/Field';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Mail, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import gsap from 'gsap';

export const dynamic = 'force-dynamic';

export default function VerifyEmailPage() {
  const [email, setEmail] = useState<string>('');
  const [isResending, setIsResending] = useState(false);
  const supabase = createClient();

  const kanjiRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
      } else {
        setEmail(sessionStorage.getItem('kata:pending-email') || '');
      }
    };
    getUser();
  }, [supabase.auth]);

  useEffect(() => {
    if (!mounted) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      // Animación del kanji
      gsap.fromTo(
        kanjiRef.current,
        {
          scale: 0,
          opacity: 0,
          rotateY: -90,
        },
        {
          scale: 1,
          opacity: 1,
          rotateY: 0,
          duration: 1.5,
          ease: 'elastic.out(1, 0.5)',
        },
      );

      // Animación continua del kanji (flotando)
      gsap.to(kanjiRef.current, {
        y: -15,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Fade in del contenido
      gsap.fromTo(
        '.verify-content',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.3, ease: 'power3.out' },
      );

      // Rotación del glow
      gsap.to('.kanji-glow', {
        rotate: 360,
        duration: 25,
        repeat: -1,
        ease: 'none',
      });
    }, containerRef);

    return () => ctx.revert();
  }, [mounted]);

  const handleResendEmail = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error('Introduce un correo válido');
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      toast.success('Email reenviado. Revisa tu bandeja de entrada.');
    } catch (error: unknown) {
      console.error('Error al reenviar email:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al reenviar el email';
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen relative overflow-hidden flex items-center justify-center p-4"
    >
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Kanji Section */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Glow effect */}
            <div className="kanji-glow absolute inset-0 blur-3xl opacity-30">
              <div className="w-full h-full bg-gradient-to-br from-emerald-500/60 via-emerald-400/40 to-transparent rounded-full" />
            </div>

            {/* Kanji character */}
            <div ref={kanjiRef} style={{ perspective: '1000px' }}>
              <span
                className="relative block text-[clamp(80px,20vw,160px)] font-bold leading-none select-none"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #10b981 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 60px rgba(16, 185, 129, 0.3)',
                  fontFamily: '"Noto Sans JP", "Hiragino Sans", sans-serif',
                }}
              >
                型
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="verify-content">
          <div className="kata-panel p-8 md:p-12">
            {/* Title */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
                <Mail size={32} className="text-emerald-400" />
              </div>
              <h1 className="kata-title-page mb-3">Verifica tu Email</h1>
              <p className="text-[var(--text-secondary)] text-lg">
                Hemos enviado un enlace de verificación a tu correo
              </p>
            </div>

            <div className="mb-8">
              <label htmlFor="verification-email" className="kata-label">
                Correo de tu cuenta
              </label>
              <TextInput
                id="verification-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                placeholder="tu@email.com"
              />
              <p className="text-xs text-[var(--text-secondary)] mt-2">
                Puedes corregirlo para reenviar el enlace de verificación.
              </p>
            </div>

            {/* Instructions */}
            <div className="space-y-4 mb-8">
              <div className="kata-panel kata-panel--subtle flex items-start gap-4 p-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[var(--text-secondary)]">
                  Revisa tu bandeja de entrada y la carpeta de spam
                </p>
              </div>
              <div className="kata-panel kata-panel--subtle flex items-start gap-4 p-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[var(--text-secondary)]">
                  Haz clic en el enlace de verificación del email
                </p>
              </div>
              <div className="kata-panel kata-panel--subtle flex items-start gap-4 p-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[var(--text-secondary)]">
                  Serás redirigido automáticamente a tu biblioteca
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                variant="primary"
                onClick={handleResendEmail}
                disabled={isResending || !email}
                className="w-full flex items-center justify-center gap-2 h-12"
              >
                {isResending ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Reenviando...
                  </>
                ) : (
                  <>
                    <Mail size={18} />
                    Reenviar Email
                  </>
                )}
              </Button>

              <ButtonLink href="/login" variant="ghost" size="lg" className="w-full">
                <ArrowLeft size={18} />
                Volver al Login
              </ButtonLink>
            </div>

            {/* Footer note */}
            <p className="text-center text-xs text-[var(--text-tertiary)] mt-6">
              El enlace expira en 24 horas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
