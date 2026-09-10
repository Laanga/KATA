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
      <div className="kata-icon-well mb-6 h-20 w-20">{icon}</div>
      <h3 className="kata-title-section mb-2">{title}</h3>
      <p className="mb-6 max-w-md text-sm text-[var(--text-secondary)]">{description}</p>
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
