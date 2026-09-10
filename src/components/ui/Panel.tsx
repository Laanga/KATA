import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
export function Panel({
  tone = 'default',
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { tone?: 'default' | 'subtle' | 'accent' }) {
  return (
    <div
      {...props}
      className={cn('kata-panel', tone !== 'default' && `kata-panel--${tone}`, className)}
    />
  );
}
