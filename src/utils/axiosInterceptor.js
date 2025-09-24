// emailxp/frontend/src/utils/axiosInterceptor.js

import axios from 'axios';
import { logout, reset } from '../store/slices/authSlice';

// This function will be called once from index.js
const configureAxios = (store) => {
  // Set the base URL for all axios requests.
  // If `REACT_APP_BACKEND_URL` is set at build time, use it (strip trailing slash).
  // Otherwise use a relative base (empty string) so requests go to the same origin.
  const rawBackend = process.env.REACT_APP_BACKEND_URL;
  axios.defaults.baseURL = rawBackend ? rawBackend.replace(/\/$/, '') : '';

  // Request interceptor
  axios.interceptors.request.use(
    (config) => {
      const { user } = store.getState().auth;
      if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.error('Authentication error caught by interceptor:', error.response.status);
        store.dispatch(logout());
        store.dispatch(reset());
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

// Export the configuration function
export { configureAxios };

// Note: Services will now just import 'axios' directly, as it will be configured globally
// by the call to configureAxios in index.js.
// So, in authService.js, userService.js, etc., you will just use:
// import axios from 'axios';
// and then axios.post, axios.get, etc.
