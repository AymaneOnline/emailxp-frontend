// emailxp/frontend/src/store/slices/campaignSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  campaigns: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

const campaignSlice = createSlice({
  name: 'campaigns',
  initialState,
  reducers: {
    resetCampaigns: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    // You would add extraReducers here to handle actions from your campaignService,
    // e.g., createCampaign, getCampaigns, updateCampaign, deleteCampaign.
    // Example:
    /*
    extraReducers: (builder) => {
      builder
        .addCase(someCampaignAction.pending, (state) => {
          state.isLoading = true;
        })
        .addCase(someCampaignAction.fulfilled, (state, action) => {
          state.isLoading = false;
          state.isSuccess = true;
          state.campaigns = action.payload; // Or add/update specific campaign
        })
        .addCase(someCampaignAction.rejected, (state, action) => {
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
        });
    },
    */
  },
});

export const { resetCampaigns } = campaignSlice.actions;
export default campaignSlice.reducer;