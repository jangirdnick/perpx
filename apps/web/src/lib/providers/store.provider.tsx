'use client';

import { useMemo } from 'react';
import { Provider } from 'react-redux';
import { AppStore, makeStore, persistor } from '../../store';
import { setupInterceptors } from '../../lib/axios';
import { PersistGate } from 'redux-persist/integration/react';
interface StoreProviderProps {
  children: React.ReactNode;
}

export default function StoreProvider({ children }: StoreProviderProps) {
  const store = useMemo<AppStore>(() => {
    const store = makeStore();
    setupInterceptors(store);
    return store;
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
