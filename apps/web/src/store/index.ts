import { configureStore } from '@reduxjs/toolkit';
import authSlice from '../modules/auth/slices/authSlice';
import chatSlice from '@/modules/chat/slices/chatSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authSlice,
      chat: chatSlice,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
