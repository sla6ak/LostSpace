import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { authApi } from "./api/authAPI";
import { currentToken } from "./slices/sliceToken";
// import { currentUser } from "./slices/sliceUser";
// import { wsApp } from "./webSockets/ws";
// import { chat } from "./slices/sliceChat";
// import { wsConnect } from "./slices/sliceWsConnect";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

const tokenPersistConfig = {
  key: "game",
  storage,
  whitelist: ["token"],
};

const rootReducer = combineReducers({
  [authApi.reducerPath]: authApi.reducer,
  token: currentToken.reducer,
  //   user: currentUser.reducer,
  //   [wsApp.reducerPath]: wsApp.reducer,
  //   chat: chat.reducer,
  //   wsConnect: wsConnect.reducer,
});

const persistedReducer = persistReducer(tokenPersistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(authApi.middleware),
  //   .concat(wsApp.middleware),
});

export const persistor = persistStore(store);
