import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import { setupListeners } from '@reduxjs/toolkit/query';

// Import API services
import { api } from '../api/apiSlice';

// Import slice reducers
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import uiReducer from './slices/uiSlice';

// Configure persist for specific reducers
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['user', 'token'],
};

const cartPersistConfig = {
  key: 'cart',
  storage,
  whitelist: ['items', 'totalItems', 'totalPrice'],
};

// Combine reducers
const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  auth: persistReducer(authPersistConfig, authReducer),
  cart: persistReducer(cartPersistConfig, cartReducer),
  ui: uiReducer,
});

// Configure store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(api.middleware),
});

// Set up listeners for RTK Query
setupListeners(store.dispatch);

// Create persistor
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
