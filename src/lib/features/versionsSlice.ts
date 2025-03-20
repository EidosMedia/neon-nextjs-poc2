import { createSlice } from '@reduxjs/toolkit';
import cloneDeep from 'lodash/cloneDeep';
import set from 'lodash/set';
import test from 'node:test';

const initialState: Record<string, object> = {
  test: {},
};

export const versionsSlice = createSlice({
  name: 'nodes',
  initialState,
  reducers: {
    // Redux Toolkit allows us to write "mutating" logic in reducers. It
    // doesn't actually mutate the state because it uses the Immer library,
    // which detects changes to a "draft state" and produces a brand new
    // immutable state based off those changes

    // Document actions
    setVersions: (state, action) => {
      if (!state[action.payload.id]) {
        state[action.payload.id] = {};
      }
      console.log('action.payload', action.payload);
      state[action.payload.id].versions = action.payload.versions;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setVersions } = versionsSlice.actions;

// Selectors
export const getVersions = (id: string) => (state: any) => {
  console.log('state', state);
  return state.nodes && state.nodes[id]?.versions; // editorContainer.currentDocument is the id of the current document
};

export default versionsSlice.reducer;
