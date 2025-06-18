import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import campaignSlice from './slices/campaignSlice';
import listSlice from './slices/listSlice';
import templateSlice from './slices/templateSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    campaigns: campaignSlice,
    lists: listSlice,
    templates: templateSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;