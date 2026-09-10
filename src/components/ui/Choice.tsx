'use client';
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
export function Chip({
  selected,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected: boolean }) {
  return (
    <button type="button" {...props} aria-pressed={selected} className={cn('kata-chip', className)}>
      {children}
    </button>
  );
}
export function RadioChoice({
  children,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { children: ReactNode }) {
  return (
    <label className={cn('kata-choice text-sm', className)}>
      <input {...props} type="radio" className="sr-only" />
      {children}
      {props.checked && <Check size={16} aria-hidden="true" className="ml-auto shrink-0" />}
    </label>
  );
}
