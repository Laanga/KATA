'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { isValidEmail, isValidUsername, isValidPassword } from '@/lib/utils/validation';

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export const AuthForm = ({ mode }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      // El usuario será redirigido automáticamente a Google
    } catch (error: any) {
      console.error('Error con Google OAuth:', error);
      toast.error(error.message || 'Error al iniciar sesión con Google');
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    if (!isValidEmail(email)) {
      toast.error('Por favor ingresa un email válido');
      return;
    }

    // Validate password
    const passwordValidation = isValidPassword(password);
    if (!passwordValidation.valid) {
      toast.error(passwordValidation.message || 'Contraseña inválida');
      return;
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        toast.error('Las contraseñas no coinciden');
        return;
      }

      // Validate username
      if (!isValidUsername(username)) {
        toast.error('El nombre de usuario debe tener entre 3 y 30 caracteres y solo puede contener letras, números, guiones y guiones bajos');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        // Timeout para evitar que se quede colgado
        const loginPromise = supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('La solicitud está tardando demasiado. Por favor intenta de nuevo.')), 10000)
        );

        const { data, error } = await Promise.race([loginPromise, timeoutPromise]) as any;

        if (error) throw error;

        // Verificar si el email está confirmado
        if (data.user && !data.user.email_confirmed_at) {
          toast.error('Por favor verifica tu email antes de iniciar sesión');
          setIsLoading(false);
          // Pequeño delay para que el toast se muestre
          setTimeout(() => {
            window.location.href = '/verify-email';
          }, 1000);
          return;
        }

        toast.success('¡Bienvenido de vuelta!');
        setIsLoading(false);
        // Usar window.location para forzar navegación completa y cargar el estado de auth
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        // Timeout para evitar que se quede colgado
        const signupPromise = supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              username: username.trim(),
            },
          },
        });

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('La solicitud está tardando demasiado. Por favor intenta de nuevo.')), 10000)
        );

        const { data, error } = await Promise.race([signupPromise, timeoutPromise]) as any;

        if (error) throw error;

        // Si el email requiere verificación
        if (data.user && !data.session) {
          toast.success('¡Cuenta creada! Por favor verifica tu email antes de iniciar sesión.');
          setIsLoading(false);
          // Redirigir a página de verificación pendiente
          setTimeout(() => {
            window.location.href = '/verify-email';
          }, 1000);
        } else {
          toast.success('¡Cuenta creada con éxito!');
          setIsLoading(false);
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        }
      }
    } catch (error: any) {
      console.error('Error de autenticación:', error);
      
      if (error.message?.includes('Invalid login credentials')) {
        toast.error('Credenciales incorrectas');
      } else if (error.message?.includes('User already registered')) {
        toast.error('Este email ya está registrado');
      } else {
        toast.error(error.message || 'Error en la autenticación');
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="w-full space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">
          {mode === 'login' ? 'Bienvenido de nuevo' : 'Únete a Kata'}
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          {mode === 'login'
            ? '¿No tienes cuenta? '
            : '¿Ya tienes cuenta? '}
          <Link
            href={mode === 'login' ? '/signup' : '/login'}
            className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Nombre de Usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                placeholder="Tu nombre"
              />
            </div>
          )}

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

          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-[var(--text-secondary)]">
                Contraseña
              </label>
              {mode === 'login' && (
                <a
                  href="/forgot-password"
                  className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              )}
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              placeholder="••••••••"
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Confirmar Contraseña
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
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || isGoogleLoading}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading
            ? 'Cargando...'
            : mode === 'login'
            ? 'Iniciar Sesión'
            : 'Crear Cuenta'}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-[var(--bg-primary)] text-[var(--text-tertiary)]">
            O continúa con
          </span>
        </div>
      </div>

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading || isGoogleLoading}
        className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {isGoogleLoading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span>Conectando...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continuar con Google</span>
          </>
        )}
      </button>
    </div>
  );
};
