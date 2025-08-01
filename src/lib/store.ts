import { configureStore } from '@reduxjs/toolkit';
import webauth from './features/webauthSlice';
import nodes from './features/versionsSlice';
import loggedUser from './features/loggedUserSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      webauth,
      nodes,
      loggedUser
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
