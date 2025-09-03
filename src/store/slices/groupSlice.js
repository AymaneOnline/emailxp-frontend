// emailxp/frontend/src/store/slices/groupSlice.js

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  groups: [],
  isLoading: false,
};

const groupSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    setGroups: (state, action) => {
      state.groups = action.payload;
    },
    addGroup: (state, action) => {
      state.groups.push(action.payload);
    },
    updateGroup: (state, action) => {
      const index = state.groups.findIndex(group => group._id === action.payload._id);
      if (index !== -1) {
        state.groups[index] = action.payload;
      }
    },
    removeGroup: (state, action) => {
      state.groups = state.groups.filter(group => group._id !== action.payload);
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
  // You would add extraReducers here to handle actions from your groupService,
  // e.g., createGroup, getGroups, updateGroup, deleteGroup.
});

export const { setGroups, addGroup, updateGroup, removeGroup, setLoading } = groupSlice.actions;
export default groupSlice.reducer;