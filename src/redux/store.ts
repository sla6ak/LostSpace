import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { authApi } from './api/authAPI';
import { chatApi } from './api/chatAPI';
import { heroAPI } from './api/heroAPI';
import { currentToken } from './slices/sliceToken';
import { planetsSlice } from './slices/sliceStatePlanets';
import heroSlice from './slices/sliceStateHero';
import webSocketSlice from './slices/sliceWebSocket';
import userSlice from './slices/sliceUser';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';
import { heroPositionMiddleware } from './middleware/heroPositionMiddleware';

// Создаем кастомное хранилище для случаев, когда localStorage недоступен
const createNoopStorage = () => {
  return {
    getItem(_key: string) {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: any) {
      return Promise.resolve(value);
    },
    removeItem(_key: string) {
      return Promise.resolve();
    },
  };
};

// Используем localStorage если он доступен, иначе используем noopStorage
const storage = typeof window !== 'undefined' ? createWebStorage('local') : createNoopStorage();

const tokenPersistConfig = {
  key: 'game',
  storage,
  whitelist: ['token', 'user'],
};

const rootReducer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  [chatApi.reducerPath]: chatApi.reducer,
  token: currentToken.reducer,
  planetsSlice: planetsSlice.reducer,
  heroSlice: heroSlice.reducer,
  webSocket: webSocketSlice.reducer,
  user: userSlice.reducer,
  [heroAPI.reducerPath]: heroAPI.reducer,
});

const persistedReducer = persistReducer(tokenPersistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }).concat(authApi.middleware, chatApi.middleware, heroAPI.middleware, heroPositionMiddleware),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
