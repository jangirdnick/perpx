import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authSlice from '../modules/auth/slices/authSlice';
import chatSlice from '@/modules/chat/slices/chatSlice';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import persistStore from 'redux-persist/es/persistStore';

const persistConfig = {
  key: 'perpx-root',
  storage,
  whitelist: ['auth', 'chat'],
};

const chatPersistConfig = {
  key: 'chat',
  storage,
  blacklist: ['isStreaming', 'streamingMessage', 'error'],
};

const rootReducer = combineReducers({
  auth: authSlice,
  // chatReducer par persist lagaya
  chat: persistReducer(chatPersistConfig, chatSlice),
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const makeStore = () => {
  return configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        // Redux toolkit ko persist ke functions par gussa aane se rokne ke liye
        serializableCheck: {
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
        },
      }),
  });
};

export const persistor = persistStore(makeStore());

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
