import { configureStore, combineReducers } from "@reduxjs/toolkit"
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist"
import storage from "redux-persist/lib/storage"

import { baseApi as api } from "./api/baseApi"
import authSlice from "./api/auth/auth.slice"
const persistConfig = {
  key: "root",
  version: 1,
  storage,
  whitelist: ["auth", "shop"], // only auth and shop will be persisted
}

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  auth: authSlice,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(api.middleware),
})

export const persistor = persistStore(store)

export type RootState = {
  [api.reducerPath]: ReturnType<typeof api.reducer>
}

export type AppDispatch = typeof store.dispatch
