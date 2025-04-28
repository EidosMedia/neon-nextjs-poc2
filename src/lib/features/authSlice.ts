import { createSlice } from '@reduxjs/toolkit';

const initialState: Record<string, string> = {};

export const authSlices = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Redux Toolkit allows us to write "mutating" logic in reducers. It
    // doesn't actually mutate the state because it uses the Immer library,
    // which detects changes to a "draft state" and produces a brand new
    // immutable state based off those changes

    // Document actions
    setAuthData: (state, action) => {
      state.user = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setAuthData } = authSlices.actions;

// Selectors
export const getAuthData = (state: any) => state.auth;

export default authSlices.reducer;
