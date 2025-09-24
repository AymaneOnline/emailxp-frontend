// emailxp/frontend/src/services/api.js

import axios from 'axios';
import { getAuthToken } from '../utils/authToken';

// Create an axios instance with default config
const api = axios.create({
  baseURL: '/api',
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