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
      if (!state[familyRef+action.payload.viewStatus]) {
        state[familyRef+action.payload.viewStatus] = {};
      }
      const history: NodeHistory = {
        id: action.payload.id,
        version: action.payload.version,
        viewStatus: action.payload.viewStatus,
        acquireTimestamp: action.payload.acquireTimestamp,
        versions: action.payload.versions,
      };

      state[familyRef+action.payload.viewStatus].history = history;
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
      if (!state[familyRef+action.payload.viewStatus]) {
        state[familyRef+action.payload.viewStatus] = {};
      }
      state[familyRef+action.payload.viewStatus].lastAcquire = action.payload.lastAcquire;
      console.log('setLoadingHistory ',familyRef+action.payload.viewStatus, ' lastAcquire:', state[familyRef+action.payload.viewStatus].lastAcquire);
    },  
  }
});

// Action creators are generated for each case reducer function
export const { setHistory, setVersionPanelOpen, setEdited, setLoadingHistory} = versionsSlice.actions;

// Selectors
export const getHistory = (id: string, viewStatus: string) => (state: any) : NodeHistory => {
  if (!id) {
    return {
      id: '',
      version: '',
      acquireTimestamp: 0,
      versions: [],
      viewStatus: 'LIVE',
      latestLiveVersion: '',
      latestEditableVersion: '',
    } as NodeHistory;
  }
  return state.nodes && state.nodes[getFamilyRef(id)+viewStatus]?.history; // editorContainer.currentDocument is the id of the current document
};
export const getVersionsPanelOpened = (state: any) => {
  return state.nodes && state.nodes.versionPanelOpen; // editorContainer.currentDocument is the id of the current document
};
export const getEdited = (state: any) => {
  return state.nodes && state.nodes.edited;
};


export const getLoadingHistory = (id: string, viewStatus: string) => (state: any) : number => {
  if (id && state.nodes) {
    const familyRef = getFamilyRef(id);
    console.log('getLoadingHistory ',familyRef+viewStatus, ' lastAcquire:', state.nodes[familyRef+viewStatus]?.lastAcquire);
    return state.nodes[getFamilyRef(id)+viewStatus]?.lastAcquire || 0; // Return the last acquire timestamp or 0 if not found
  } else {
    return 0;
  }
};


export default versionsSlice.reducer;
