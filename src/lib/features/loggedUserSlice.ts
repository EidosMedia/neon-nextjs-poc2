import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { ViewStatus } from '@eidosmedia/neon-frontoffice-ts-sdk';
import type { PreviewReaderTier } from '@/app/_v2/lib/paywall';
import type { EditorialViewport, ViewportOrientation } from '@/app/components/LoggedUserOverlay/viewport';

interface LoggedUserState {
  inspectItemsVisible: boolean;
  inspectItems: boolean;
  analytics: boolean;
  viewStatus?: ViewStatus;
  previewReaderTier: PreviewReaderTier;
  editorialViewport: EditorialViewport;
  viewportOrientation: ViewportOrientation;
  editorialBarVisible: boolean;
}

const initialState: LoggedUserState = {
  inspectItemsVisible: false,
  inspectItems: false,
  analytics: false,
  viewStatus: undefined,
  // Keep editorial content editable (including embedded preview) until simulation is selected.
  previewReaderTier: 'PREMIUM',
  editorialViewport: 'responsive',
  viewportOrientation: 'portrait',
  editorialBarVisible: false,
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
    setPreviewReaderTier: (state, action: PayloadAction<PreviewReaderTier>) => {
      state.previewReaderTier = action.payload;
    },
    setEditorialViewport: (state, action: PayloadAction<EditorialViewport>) => {
      state.editorialViewport = action.payload;
    },
    setViewportOrientation: (state, action: PayloadAction<ViewportOrientation>) => {
      state.viewportOrientation = action.payload;
    },
    setEditorialBarVisible: (state, action: PayloadAction<boolean>) => {
      state.editorialBarVisible = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setInspectItemsVisible, setInspectItems, setAnalytics, setViewStatus, setPreviewReaderTier, setEditorialViewport, setViewportOrientation, setEditorialBarVisible } = loggedUserSlice.actions;

// Selectors
export const getInspectItemsVisible = (state: any) => {
  return state?.loggedUser?.inspectItemsVisible;
};
export const getInspectItems = (state: any) => {
  return state?.loggedUser?.inspectItems;
};
export const getAnalytics = (state: any) => {
  return state?.loggedUser?.analytics;
};
export const getViewStatus = (state: any) => {
  return state?.loggedUser?.viewStatus;
};

export default loggedUserSlice.reducer;
