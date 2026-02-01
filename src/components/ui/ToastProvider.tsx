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
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '0.75rem',
          padding: '1rem',
        },
        success: {
          iconTheme: {
            primary: 'var(--accent-success)',
            secondary: 'var(--bg-secondary)',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: 'var(--bg-secondary)',
          },
        },
      }}
    />
  );
}
