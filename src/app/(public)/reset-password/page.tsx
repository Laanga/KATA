'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft, Lock, CheckCircle, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const supabase = createClient();

  useEffect(() => {
    // Verificar si hay una sesión válida (el usuario llegó desde el email)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsValidSession(!!session);
    };
    checkSession();

    // Escuchar cambios de autenticación (cuando Supabase procesa el token del URL)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidSession(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

      setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success('Contraseña actualizada correctamente');

      // Cerrar sesión para que el usuario inicie con la nueva contraseña
      await supabase.auth.signOut();
    } catch (error: unknown) {
      console.error('Error al actualizar contraseña:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar la contraseña';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isValidSession === null) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
          {isSuccess ? (
            /* Success state */
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  ¡Contraseña actualizada!
                </h2>
                <p className="text-[var(--text-secondary)] text-sm">
                  Tu contraseña ha sido cambiada correctamente
                </p>
              </div>
              <Link
                href="/login"
                className="inline-block w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] text-center"
              >
                Iniciar sesión
              </Link>
            </div>
          ) : !isValidSession ? (
            /* Invalid/expired link state */
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Enlace inválido o expirado
                </h2>
                <p className="text-[var(--text-secondary)] text-sm">
                  El enlace de recuperación ha expirado o ya fue utilizado
                </p>
              </div>
              <Link
                href="/forgot-password"
                className="inline-block w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] text-center"
              >
                Solicitar nuevo enlace
              </Link>
            </div>
          ) : (
            /* Form state */
            <div className="space-y-8">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                  <Lock className="w-7 h-7 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Nueva contraseña
                </h2>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Ingresa tu nueva contraseña
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Nueva contraseña
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    placeholder="••••••••"
                  />
                  <p className="mt-1.5 text-xs text-[var(--text-tertiary)]">
                    Mínimo 6 caracteres
                  </p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Confirmar contraseña
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
    </div>
  );
}
