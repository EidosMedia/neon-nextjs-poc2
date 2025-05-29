import { createSlice } from '@reduxjs/toolkit';

interface LoggedUserState {
  inspectItems: boolean;
  analytics: boolean;
}

const initialState: LoggedUserState = {
  inspectItems: false,
  analytics: false,
};

export const loggedUserSlice = createSlice({
  name: 'loggedUser',
  initialState,
  reducers: {
    // Redux Toolkit allows us to write "mutating" logic in reducers. It
    // doesn't actually mutate the state because it uses the Immer library,
    // which detects changes to a "draft state" and produces a brand new
    // immutable state based off those changes

    // Document actions
    setInspectItems: (state, action) => {
      state.inspectItems = action.payload;
    },
    setAnalytics: (state, action) => {
      state.analytics = action.payload;
    }
  },
});

// Action creators are generated for each case reducer function
export const { setInspectItems, setAnalytics} = loggedUserSlice.actions;

// Selectors
export const getInspectItems = (state: any) => {
  return state && state.loggedUser.inspectItems;
};
export const getAnalytics = (state: any) => {
  return state && state.loggedUser.analytics;
};

export default loggedUserSlice.reducer;
