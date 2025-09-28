// emailxp/frontend/src/services/api.js

import axios from 'axios';
import { getAuthToken } from '../utils/authToken';
import { getBackendUrl } from '../utils/getBackendUrl';

// Resolve backend base (may be runtime-injected, build-time env, or empty)
const backendBase = (getBackendUrl() || '').replace(/\/$/, '');
const apiBase = backendBase ? `${backendBase}/api` : '/api';

// Create an axios instance with default config
const api = axios.create({
  baseURL: apiBase,
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;