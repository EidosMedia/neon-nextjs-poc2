import { getFamilyRef } from '@/utilities/content';
import { createSlice } from '@reduxjs/toolkit';
import { NodeHistory } from '@/neon-frontoffice-ts-sdk/src';
import { identity } from 'lodash';

const initialState: Record<string, any> = {
  edited: false,
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
    setHistory: (state, action) => {
      const familyRef = getFamilyRef(action.payload.id);
      if (!state[familyRef]) {
        state[familyRef] = {};
      }
      const history: NodeHistory = {
        id: action.payload.id,
        version: action.payload.version,
        acquireTimestamp: action.payload.acquireTimestamp,
        versions: action.payload.versions,
      };

      state[familyRef].history = history;
      // Update the versions and version in the state
    },
    setVersionPanelOpen: (state, action) => {
      state.versionPanelOpen = action.payload;
    },
    setEdited: (state, action) => {
      state.edited = action.payload;
    },
    setLoadingHistory: (state, action) => {
      const familyRef = getFamilyRef(action.payload.id);
      if (!state[familyRef]) {
        state[familyRef] = {};
      }
      state[familyRef].lastAcquire = action.payload.lastAcquire;
      console.log('setLoadingHistory', state[familyRef].lastAcquire);
    },  
  }
});

// Action creators are generated for each case reducer function
export const { setHistory, setVersionPanelOpen, setEdited, setLoadingHistory} = versionsSlice.actions;

// Selectors
export const getHistory = (id: string) => (state: any) : NodeHistory => {
  if (!id) {
    return {
      id: '',
      version: '',
      acquireTimestamp: 0,
      versions: [],
    } as NodeHistory;
  }
  return state.nodes && state.nodes[getFamilyRef(id)]?.history; // editorContainer.currentDocument is the id of the current document
};
export const getVersionsPanelOpened = (state: any) => {
  return state.nodes && state.nodes.versionPanelOpen; // editorContainer.currentDocument is the id of the current document
};
export const getEdited = (state: any) => {
  return state.nodes && state.nodes.edited;
};


export const getLoadingHistory = (id: string) => (state: any) : number => {
  if (id && state.nodes) {
    console.log('getLoadingHistory', state.nodes[getFamilyRef(id)]?.lastAcquire);
    return state.nodes[getFamilyRef(id)]?.lastAcquire || 0; // Return the last acquire timestamp or 0 if not found
  } else {
    return 0;
  }
};


export default versionsSlice.reducer;
