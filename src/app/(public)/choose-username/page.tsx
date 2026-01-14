'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { isValidUsername } from '@/lib/utils/validation';

export const dynamic = 'force-dynamic';

export default function ChooseUsernamePage() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        window.location.href = '/login';
        return;
      }

      // Si ya tiene username, redirigir al dashboard
      if (user.user_metadata?.username) {
        window.location.href = '/';
        return;
      }

      setIsChecking(false);
    };

    checkUser();
  }, [supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar username
    if (!isValidUsername(username)) {
      toast.error('El nombre de usuario debe tener entre 3 y 30 caracteres y solo puede contener letras, números, guiones y guiones bajos');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          username: username.trim(),
        },
      });

      if (error) throw error;

      toast.success('¡Nombre de usuario guardado!');
      window.location.href = '/';
    } catch (error: any) {
      console.error('Error al guardar username:', error);
      toast.error(error.message || 'Error al guardar el nombre de usuario');
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-[var(--accent-primary)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-[var(--bg-secondary)] border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-emerald-500/10 p-4">
              <User size={48} className="text-emerald-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center text-white mb-2">
            Elige tu Nombre de Usuario
          </h1>
          
          <p className="text-center text-[var(--text-secondary)] mb-6">
            Para completar tu registro, elige un nombre de usuario único para tu cuenta.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Nombre de Usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ej: langa123"
                className="w-full rounded-lg border border-white/10 bg-[var(--bg-tertiary)] px-4 py-3 text-white placeholder-[var(--text-tertiary)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)] transition-colors"
                required
                minLength={3}
                maxLength={30}
                pattern="^[a-zA-Z0-9_-]+$"
                autoFocus
              />
              <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                3-30 caracteres. Solo letras, números, guiones y guiones bajos.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={isLoading || !username.trim()}
              className="w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                'Continuar'
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--text-tertiary)] mt-6">
          Este nombre aparecerá en tu perfil y será visible para ti
        </p>
      </div>
    </div>
  );
}
