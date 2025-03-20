import { configureStore } from '@reduxjs/toolkit';
import auth from './features/authSlice';
import nodes from './features/versionsSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth,
      nodes,
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
