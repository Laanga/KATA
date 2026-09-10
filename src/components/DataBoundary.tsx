'use client';
import { usePathname } from 'next/navigation';
import { useMediaStore } from '@/lib/store';
import { Button } from './ui/Button';
export function DataBoundary({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const error = useMediaStore((s) => s.error);
  const loading = useMediaStore((s) => s.isLoading);
  const initialize = useMediaStore((s) => s.initialize);
  const refresh = useMediaStore((s) => s.refreshItems);
  const initialized = useMediaStore((s) => s.isInitialized);
  if (error && ['/home', '/library', '/profile', '/onboarding'].includes(path))
    return (
      <main className="min-h-screen grid place-items-center p-6">
        <div className="max-w-md text-center space-y-5" role="alert">
          <h1 className="kata-title-page">No pudimos actualizar tu biblioteca</h1>
          <p>{error}</p>
          <Button
            isLoading={loading}
            onClick={() => void (initialized ? refresh() : initialize()).catch(() => {})}
          >
            Reintentar
          </Button>
        </div>
      </main>
    );
  return children;
}
