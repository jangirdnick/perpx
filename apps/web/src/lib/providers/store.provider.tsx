'use client';

import { useMemo } from 'react';
import { Provider } from 'react-redux';
import { AppStore, makeStore } from '../../store';
import { setupInterceptors } from '../../lib/axios';

interface StoreProviderProps {
  children: React.ReactNode;
}

export default function StoreProvider({ children }: StoreProviderProps) {
  const store = useMemo<AppStore>(() => {
    const store = makeStore();
    setupInterceptors(store);
    return store;
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
