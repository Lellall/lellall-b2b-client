import { configureStore, combineReducers } from "@reduxjs/toolkit"
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist"
import storage from "redux-persist/lib/storage"

import { baseApi as api } from "./api/baseApi"
import { vatApi } from "./api/vat/vat.api"
import { serviceFeeApi } from "./api/service-fee/service-fee.api"
import authSlice from "./api/auth/auth.slice"
const persistConfig = {
  key: "root",
  version: 1,
  storage,
  whitelist: ["auth", "shop"], // only auth and shop will be persisted
}

const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  [vatApi.reducerPath]: vatApi.reducer,
  [serviceFeeApi.reducerPath]: serviceFeeApi.reducer,
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
    }).concat(api.middleware, vatApi.middleware, serviceFeeApi.middleware),
})

export const persistor = persistStore(store)

export type RootState = {
  [api.reducerPath]: ReturnType<typeof api.reducer>
  [vatApi.reducerPath]: ReturnType<typeof vatApi.reducer>
  [serviceFeeApi.reducerPath]: ReturnType<typeof serviceFeeApi.reducer>
  auth: ReturnType<typeof authSlice>
}

export type AppDispatch = typeof store.dispatch
