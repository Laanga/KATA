'use client';

import { useEffect } from 'react';
import { useMediaStore } from '@/lib/store';
import { MOCK_MEDIA_ITEMS } from '@/lib/mock-data';

export function StoreInitializer() {
  const setItems = useMediaStore((state) => state.setItems);
  const items = useMediaStore((state) => state.items);

  useEffect(() => {
    // Only initialize if store is empty
    if (items.length === 0) {
      setItems(MOCK_MEDIA_ITEMS);
    }
  }, []);

  return null;
}
