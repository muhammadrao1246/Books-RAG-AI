import { configureStore } from '@reduxjs/toolkit'
// Or from '@reduxjs/toolkit/query/react'
import { setupListeners } from '@reduxjs/toolkit/query'
import { combineReducers } from 'redux'

import { authApi, dataApi } from './api'
import authReducer from './authSlice'
import userReducer from './userSlice'

import {persistStore, persistReducer} from 'redux-persist'
import storage from 'redux-persist/es/storage'

import { FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';


// defining persist config
const persistConfig = {
  key: "root",
  storage,
  whitelist: ['auth', 'user'] // reducers should be persisted
}

// combining all reducers into one
const RootCombinedReducer = combineReducers({
  // Add the generated reducer as a specific top-level slice
  [authApi.reducerPath]: authApi.reducer,
  [dataApi.reducerPath]: dataApi.reducer,
  auth: authReducer,
  user: userReducer
})

const persistedReducer = persistReducer(persistConfig, RootCombinedReducer)

export const store = configureStore({
  reducer: persistedReducer,

  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(authApi.middleware, dataApi.middleware),
})



// creating a persistor 
export let persistor = persistStore(store)


// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
setupListeners(store.dispatch)
