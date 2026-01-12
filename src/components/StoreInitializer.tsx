'use client';

import { useEffect } from 'react';
import { useMediaStore } from '@/lib/store';

export function StoreInitializer() {
  const initialize = useMediaStore((state) => state.initialize);
  
  useEffect(() => {
    initialize();
  }, [initialize]);

  return null;
}
