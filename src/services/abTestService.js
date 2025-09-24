// emailxp/frontend/src/services/abTestService.js

import axios from 'axios';
import { getAuthToken } from '../utils/authToken';

const AB_TEST_API_PATH = '/api/ab-tests';

// Create axios instance with default config and auth
const abTestAPI = axios.create({
  baseURL: AB_TEST_API_PATH,
});

abTestAPI.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Add interceptor to handle errors
abTestAPI.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const abTestService = {
  // Create a new A/B test
  createABTest: async (campaignData, abTestData) => {
    try {
      const response = await abTestAPI.post('/', { campaignData, abTestData });
      return response.data;
    } catch (error) {
      console.error('Error creating A/B test:', error);
      throw error;
    }
  },

  // Get all A/B tests
  getABTests: async (filters = {}) => {
    try {
      const response = await abTestAPI.get('/', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching A/B tests:', error);
      throw error;
    }
  },

  // Get a specific A/B test
  getABTest: async (id) => {
    try {
      const response = await abTestAPI.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching A/B test:', error);
      throw error;
    }
  },

  // Start an A/B test
  startABTest: async (id) => {
    try {
      const response = await abTestAPI.post(`/${id}/start`);
      return response.data;
    } catch (error) {
      console.error('Error starting A/B test:', error);
      throw error;
    }
  },

  // Stop an A/B test
  stopABTest: async (id) => {
    try {
      const response = await abTestAPI.post(`/${id}/stop`);
      return response.data;
    } catch (error) {
      console.error('Error stopping A/B test:', error);
      throw error;
    }
  },

  // Declare a winner for an A/B test
  declareWinner: async (id, variantId = null) => {
    try {
      const response = await abTestAPI.post(`/${id}/declare-winner`, { variantId });
      return response.data;
    } catch (error) {
      console.error('Error declaring A/B test winner:', error);
      throw error;
    }
  },

  // Delete an A/B test
  deleteABTest: async (id) => {
    try {
      const response = await abTestAPI.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting A/B test:', error);
      throw error;
    }
  }
};

export default abTestService;