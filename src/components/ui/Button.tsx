'use client';
import type { ComponentProps } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'warning';
export type ButtonSize = 'sm' | 'md' | 'lg';
export function buttonStyles({
  variant = 'primary',
  size = 'md',
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn('kata-button', `kata-button--${variant}`, `kata-button--${size}`, className);
}
export interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}
export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className,
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={buttonStyles({ variant, size, className })}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
    >
      {isLoading && <Loader2 aria-hidden="true" size={16} className="animate-spin" />}
      {children}
    </button>
  );
}
export function IconButton({
  label,
  children,
  className,
  ...props
}: ButtonProps & { label: string }) {
  return (
    <Button
      variant="ghost"
      {...props}
      aria-label={label}
      className={cn('kata-button--icon', className)}
    >
      {children}
    </Button>
  );
}
export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: React.ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <Link {...props} className={buttonStyles({ variant, size, className })} />;
}

/** Full-width action with supporting content, used in settings and lists. */
export function ActionButton({ className, ...props }: ButtonProps) {
  return <Button variant="secondary" {...props} className={cn('kata-button--row', className)} />;
}

/** A cover remains a cover; interaction, focus and surface come from the system. */
export function MediaButton({ className, ...props }: ComponentProps<'button'>) {
  return (
    <button
      {...props}
      type={props.type || 'button'}
      className={cn('kata-media-button', className)}
    />
  );
}
