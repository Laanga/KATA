import { AuthForm } from '@/components/auth/AuthForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function SignupPage() {
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
        href="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-white transition-colors"
      >
        <ArrowLeft size={18} />
        Volver
      </Link>

      {/* Logo */}
      <Link href="/" className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        <span className="text-3xl text-emerald-400">型</span>
        <span className="text-xl font-bold text-white">Kata</span>
      </Link>

      {/* Form container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md p-8 rounded-2xl border border-white/10 bg-black/50 backdrop-blur-xl">
          <AuthForm mode="signup" />
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
    </div>
  );
}
