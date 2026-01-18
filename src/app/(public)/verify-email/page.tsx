'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Mail, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
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
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
      }
    };
    getUser();
  }, [supabase.auth]);

  useEffect(() => {
    if (!mounted) return;

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
        }
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
        { y: 0, opacity: 1, duration: 0.8, delay: 0.3, ease: 'power3.out' }
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
    if (!email) {
      toast.error('No se pudo obtener tu email');
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
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
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
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
          <div className="bg-[var(--bg-secondary)] border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl">
            {/* Title */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
                <Mail size={32} className="text-emerald-400" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Verifica tu Email
              </h1>
              <p className="text-[var(--text-secondary)] text-lg">
                Hemos enviado un enlace de verificación a tu correo
              </p>
            </div>

            {/* Email Display */}
            {email && (
              <div className="bg-[var(--bg-tertiary)] border border-white/5 rounded-xl p-5 mb-8 text-center">
                <p className="text-emerald-400 font-medium text-lg break-all">{email}</p>
              </div>
            )}

            {/* Instructions */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 p-4 bg-[var(--bg-tertiary)]/50 rounded-lg border border-white/5">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[var(--text-secondary)]">
                  Revisa tu bandeja de entrada y la carpeta de spam
                </p>
              </div>
              <div className="flex items-start gap-4 p-4 bg-[var(--bg-tertiary)]/50 rounded-lg border border-white/5">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[var(--text-secondary)]">
                  Haz clic en el enlace de verificación del email
                </p>
              </div>
              <div className="flex items-start gap-4 p-4 bg-[var(--bg-tertiary)]/50 rounded-lg border border-white/5">
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
                className="w-full flex items-center justify-center gap-2 h-12 text-base"
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

              <Link href="/login" className="block">
                <Button variant="ghost" className="w-full h-12 flex items-center justify-center gap-2">
                  <ArrowLeft size={18} />
                  Volver al Login
                </Button>
              </Link>
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
