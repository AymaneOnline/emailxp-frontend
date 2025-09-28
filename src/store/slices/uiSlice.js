import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: localStorage.getItem('theme') || 'light',
  sidebarOpen: false,
  notifications: [],
  loading: {
    campaigns: false,
    groups: false,
    templates: false,
  },
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        createdAt: Date.now(),
        read: false,
        ...action.payload,
      });
    },
    markAsRead: (state, action) => {
      const id = action.payload;
      const n = state.notifications.find((x) => x.id === id);
      if (n) n.read = true;
    },
    markAllRead: (state) => {
      state.notifications.forEach((n) => (n.read = true));
    },
    removeAllNotifications: (state) => {
      state.notifications = [];
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    setLoading: (state, action) => {
      const { section, isLoading } = action.payload;
      state.loading[section] = isLoading;
    },
  },
});

export const {
  toggleTheme,
  toggleSidebar,
  addNotification,
  markAsRead,
  markAllRead,
  removeAllNotifications,
  removeNotification,
  setLoading,
} = uiSlice.actions;

export default uiSlice.reducer;