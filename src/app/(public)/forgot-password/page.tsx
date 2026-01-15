'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Por favor ingresa tu email');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setIsEmailSent(true);
      toast.success('Email enviado correctamente');
    } catch (error) {
      console.error('Error al enviar email:', error);
      toast.error(error instanceof Error ? error.message : 'Error al enviar el email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-black to-black" />
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Back button */}
      <Link
        href="/login"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-white transition-colors"
      >
        <ArrowLeft size={18} />
        Volver al login
      </Link>

      {/* Logo */}
      <Link href="/" className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        <span className="text-3xl text-emerald-400">型</span>
        <span className="text-xl font-bold text-white">Kata</span>
      </Link>

      {/* Form container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-2xl border border-white/10 bg-black/50 backdrop-blur-xl">
          {isEmailSent ? (
            /* Success state */
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  ¡Email enviado!
                </h2>
                <p className="text-[var(--text-secondary)] text-sm">
                  Hemos enviado un enlace de recuperación a <span className="text-white font-medium">{email}</span>
                </p>
              </div>
              <div className="pt-4 space-y-3">
                <p className="text-xs text-[var(--text-tertiary)]">
                  ¿No lo ves? Revisa tu carpeta de spam
                </p>
                <button
                  onClick={() => setIsEmailSent(false)}
                  className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Enviar de nuevo
                </button>
              </div>
            </div>
          ) : (
            /* Form state */
            <div className="space-y-8">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                  <Mail className="w-7 h-7 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  ¿Olvidaste tu contraseña?
                </h2>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  No te preocupes, te enviaremos instrucciones para recuperarla
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    placeholder="tu@email.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </button>
              </form>

              <p className="text-center text-sm text-[var(--text-secondary)]">
                ¿Recordaste tu contraseña?{' '}
                <Link
                  href="/login"
                  className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Volver al login
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
    </div>
  );
}
