import { createSlice } from '@reduxjs/toolkit';

const initialState: Record<string, any> = {
  userName: undefined,
};


export const webauthSlices = createSlice({
  name: 'webauth',
  initialState,
  reducers: {
    // Redux Toolkit allows us to write "mutating" logic in reducers. It
    // doesn't actually mutate the state because it uses the Immer library,
    // which detects changes to a "draft state" and produces a brand new
    // immutable state based off those changes

    // Document actions
    setUserName: (state, action) => {
      state.userName = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setUserName } = webauthSlices.actions;

// Selectors
export const getUserName = (state: any) => {
  return state && state.webauth.userName;
};
export default webauthSlices.reducer;
