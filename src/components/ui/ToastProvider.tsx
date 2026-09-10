'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      containerStyle={{
        zIndex: 10000,
        bottom: '80px',
      }}
      toastOptions={{
        duration: 3000,
        style: {
          background: 'var(--kata-surface-raised)',
          color: 'var(--text-primary)',
          border: '1px solid var(--kata-border)',
          borderRadius: 'var(--kata-radius-control)',
          padding: 'var(--kata-space-4)',
          boxShadow: 'var(--kata-shadow-raised)',
        },
        success: {
          iconTheme: {
            primary: 'var(--accent-success)',
            secondary: 'var(--bg-secondary)',
          },
        },
        error: {
          iconTheme: {
            primary: 'var(--kata-danger)',
            secondary: 'var(--bg-secondary)',
          },
        },
      }}
    />
  );
}
