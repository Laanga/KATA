'use client';

import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div
        className="liquid-glass-soft mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 text-[var(--accent-primary)]"
        style={{
          boxShadow:
            '0 0 40px rgba(16,185,129,0.18), inset 0 0 0 1px rgba(16,185,129,0.15), inset 0 1px 0 rgba(255,255,255,0.12)',
        }}
      >
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-semibold text-white">{title}</h3>
      <p className="mb-6 max-w-md text-sm text-[var(--text-secondary)]">{description}</p>
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
