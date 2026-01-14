'use client';

import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:cursor-not-allowed disabled:opacity-50';

  const variants = {
    primary: 'bg-[var(--accent-primary)] text-black hover:bg-[var(--accent-primary)]/90 active:scale-95',
    secondary: 'bg-[var(--accent-secondary)] text-white hover:bg-[var(--accent-secondary)]/90 active:scale-95',
    outline: 'border border-white/10 bg-transparent text-white hover:bg-white/5',
    ghost: 'bg-transparent text-[var(--text-secondary)] hover:bg-white/5 hover:text-white',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-95',
    warning: 'bg-amber-600 text-white hover:bg-amber-700 active:scale-95',
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}
