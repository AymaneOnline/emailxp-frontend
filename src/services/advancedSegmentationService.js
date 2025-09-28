// emailxp/frontend/src/services/advancedSegmentationService.js

import axios from 'axios';
import devLog from '../utils/devLog';
import { getAuthToken } from '../utils/authToken';

const ADVANCED_SEGMENTATION_API_PATH = '/api/advanced-segmentation';

// Create axios instance with default config and auth
import { getBackendUrl } from '../utils/getBackendUrl';

const base = (getBackendUrl() || '').replace(/\/$/, '');
const ADVANCED_SEGMENTATION_API = base ? `${base}/api/advanced-segmentation` : '/api/advanced-segmentation';
const advancedSegmentationAPI = axios.create({ baseURL: ADVANCED_SEGMENTATION_API });

advancedSegmentationAPI.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Add interceptor to handle errors
advancedSegmentationAPI.interceptors.response.use(
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

const advancedSegmentationService = {
  // Get segment analytics
  getSegmentAnalytics: async (segmentId) => {
    try {
      const response = await advancedSegmentationAPI.get(`/${segmentId}/analytics`);
      return response.data;
    } catch (error) {
      devLog('Error fetching segment analytics:', error);
      throw error;
    }
  },

  // Create dynamic segment based on behavior
  createDynamicSegment: async (segmentData) => {
    try {
      const response = await advancedSegmentationAPI.post('/dynamic', segmentData);
      return response.data;
    } catch (error) {
      devLog('Error creating dynamic segment:', error);
      throw error;
    }
  },

  // Get segment overlap analysis
  getSegmentOverlap: async (segmentIds) => {
    try {
      const response = await advancedSegmentationAPI.post('/overlap', { segmentIds });
      return response.data;
    } catch (error) {
      devLog('Error calculating segment overlap:', error);
      throw error;
    }
  },

  // Export segment data
  exportSegmentData: async (segmentId) => {
    try {
      const response = await advancedSegmentationAPI.get(`/${segmentId}/export`);
      return response.data;
    } catch (error) {
      devLog('Error exporting segment data:', error);
      throw error;
    }
  },
  
  // Create segment based on custom query
  createCustomQuerySegment: async (segmentData) => {
    try {
      const response = await advancedSegmentationAPI.post('/custom-query', segmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating custom query segment:', error);
      throw error;
    }
  },
  
  // Create RFM segment
  createRFMSegment: async (rfmData) => {
    try {
      const response = await advancedSegmentationAPI.post('/rfm', rfmData);
      return response.data;
    } catch (error) {
      console.error('Error creating RFM segment:', error);
      throw error;
    }
  }
};

export default advancedSegmentationService;