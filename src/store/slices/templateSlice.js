// emailxp/frontend/src/store/slices/templateSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  templates: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

const templateSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    resetTemplates: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    // You would add extraReducers here to handle actions from your templateService,
    // e.g., createTemplate, getTemplates, updateTemplate, deleteTemplate.
  },
});

export const { resetTemplates } = templateSlice.actions;
export default templateSlice.reducer;