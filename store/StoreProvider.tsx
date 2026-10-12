// store/StoreProvider.tsx
'use client';

import { useState } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from './index';

type StoreProviderPropsType = {
  children: React.ReactNode;
};

export default function StoreProvider({ children }: StoreProviderPropsType) {
  const [store] = useState<AppStore>(() => makeStore());
  return <Provider store={store}>{children}</Provider>;
}
