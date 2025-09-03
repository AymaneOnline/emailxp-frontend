// emailxp/frontend/src/store/store.js

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import campaignReducer from './slices/campaignSlice'; // NEW IMPORT
import groupReducer from './slices/groupSlice';       // NEW IMPORT
import templateReducer from './slices/templateSlice'; // NEW IMPORT

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    campaigns: campaignReducer, // Add campaigns reducer
    groups: groupReducer,         // Add groups reducer
    templates: templateReducer, // Add templates reducer
  },
});