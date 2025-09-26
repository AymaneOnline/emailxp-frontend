// emailxp/frontend/src/services/api.js

import axios from 'axios';
import { getAuthToken } from '../utils/authToken';
import { getBackendUrl } from '../utils/getBackendUrl';

// Resolve backend once at module load for consistent base across requests
const resolvedBackend = getBackendUrl();
// Export for debugging / other services if needed
export const BASE_BACKEND_URL = resolvedBackend;

// Create an axios instance with default config.
// If a backend URL is provided (build-time or runtime) use that as the base
// otherwise keep a relative base so requests go to the same origin.
const backend = resolvedBackend;
const baseURL = backend ? `${backend.replace(/\/$/, '')}/api` : '/api';

const api = axios.create({
  baseURL,
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