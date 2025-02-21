import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { apiSlice } from '../slices/apiSlice';
import authReducer from '../slices/authSlice';
import stepReducer from '../slices/stepSlice';
import ownerReducer from '../slices/ownerSlice';
import coverageOwnersReducer from '../slices/coverageOwnersSlice';
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
  blacklist: [apiSlice.reducerPath],
};

const persistedReducer = persistReducer(persistConfig, authReducer);

const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: persistedReducer,
    step: stepReducer,
    owner: ownerReducer,
    coverageOwners: coverageOwnersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);
export default store;