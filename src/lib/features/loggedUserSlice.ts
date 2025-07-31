import { createSlice } from '@reduxjs/toolkit';

interface LoggedUserState {
  inspectItemsVisible: boolean;
  inspectItems: boolean;
  analytics: boolean;
  viewStatus?: string;
}

const initialState: LoggedUserState = {
  inspectItemsVisible: false,
  inspectItems: false,
  analytics: false,
  viewStatus: undefined,
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
    setInspectItemsVisible: (state, action) => {
      state.inspectItemsVisible = action.payload;
    },
    setInspectItems: (state, action) => {
      state.inspectItems = action.payload;
    },
    setAnalytics: (state, action) => {
      state.analytics = action.payload;
    },
    setViewStatus: (state, action) => {
      state.viewStatus = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setInspectItemsVisible, setInspectItems, setAnalytics, setViewStatus } = loggedUserSlice.actions;

// Selectors
export const getInspectItemsVisible = (state: any) => {
  return state && state.loggedUser.inspectItemsVisible;
};
export const getInspectItems = (state: any) => {
  return state && state.loggedUser.inspectItems;
};
export const getAnalytics = (state: any) => {
  return state && state.loggedUser.analytics;
};
export const getViewStatus = (state: any) => {
  return state && state.loggedUser.viewStatus;
};

export default loggedUserSlice.reducer;
