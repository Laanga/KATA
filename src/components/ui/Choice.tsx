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

export function ColorSwatch({
  color,
  selected,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { color: string; selected: boolean }) {
  return (
    <button
      {...props}
      type="button"
      aria-label={`Color ${color}`}
      aria-pressed={selected}
      className={cn('kata-swatch', className)}
    >
      <span style={{ backgroundColor: color }} />
      {selected && <Check size={16} aria-hidden="true" />}
    </button>
  );
}

export function Checkbox({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} type="checkbox" className={cn('kata-checkbox', className)} />;
}

export function FilePicker({
  children,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { children: ReactNode }) {
  return (
    <label className={cn('kata-file-picker', className)}>
      <input {...props} type="file" className="sr-only" />
      {children}
    </label>
  );
}
