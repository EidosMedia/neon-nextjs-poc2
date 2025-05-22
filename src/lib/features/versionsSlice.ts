import { getFamilyRef } from '@/utilities/content';
import { createSlice } from '@reduxjs/toolkit';

const initialState: Record<string, any> = {
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
      const familyRef = getFamilyRef(action.payload.id);
      if (!state[familyRef]) {
        state[familyRef] = {};
      }
      state[familyRef].versions = action.payload.versions;
    },
    setVersionPanelOpen: (state, action) => {
      state.versionPanelOpen = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setVersions, setVersionPanelOpen } = versionsSlice.actions;

// Selectors
export const getVersions = (id: string) => (state: any) => {
  if (!id) return null;
  return state.nodes && state.nodes[getFamilyRef(id)]?.versions; // editorContainer.currentDocument is the id of the current document
};
export const getVersionsPanelOpened = (state: any) => {
  return state.nodes && state.nodes.versionPanelOpen; // editorContainer.currentDocument is the id of the current document
};

export default versionsSlice.reducer;
