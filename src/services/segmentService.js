// emailxp/frontend/src/services/segmentService.js

import axios from 'axios';

const SEGMENTS_API_PATH = '/api/segments';

// Create axios instance with default config and auth
const segmentAPI = axios.create({
  baseURL: SEGMENTS_API_PATH,
});

segmentAPI.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = user && user.token ? user.token : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const segmentService = {
  // Get all segments
  getSegments: async () => {
    try {
      const response = await segmentAPI.get('/');
      return response.data;
    } catch (error) {
      console.error('Error fetching segments:', error);
      throw error;
    }
  },

  // Get a specific segment by ID
  getSegmentById: async (id) => {
    try {
      const response = await segmentAPI.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching segment:', error);
      throw error;
    }
  },

  // Create a new segment
  createSegment: async (segmentData) => {
    try {
      const response = await segmentAPI.post('/', segmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating segment:', error);
      throw error;
    }
  },

  // Update an existing segment
  updateSegment: async (id, segmentData) => {
    try {
      const response = await segmentAPI.put(`/${id}`, segmentData);
      return response.data;
    } catch (error) {
      console.error('Error updating segment:', error);
      throw error;
    }
  },

  // Delete a segment
  deleteSegment: async (id) => {
    try {
      const response = await segmentAPI.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting segment:', error);
      throw error;
    }
  },

  // Preview segment (get count without saving)
  previewSegment: async (filters, logic = 'AND') => {
    try {
      const response = await segmentAPI.post('/preview', { filters, logic });
      return response.data;
    } catch (error) {
      console.error('Error previewing segment:', error);
      throw error;
    }
  },

  // Get subscribers for a segment
  getSegmentSubscribers: async (id, limit = 50, skip = 0) => {
    try {
      const response = await segmentAPI.get(`/${id}/subscribers`, {
        params: { limit, skip }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching segment subscribers:', error);
      throw error;
    }
  },

  // Get available filter fields
  getFilterFields: async () => {
    try {
      const response = await segmentAPI.get('/meta/fields');
      return response.data;
    } catch (error) {
      console.error('Error fetching filter fields:', error);
      throw error;
    }
  },

  // Refresh segment subscriber count
  refreshSegment: async (id) => {
    try {
      const response = await segmentAPI.post(`/${id}/refresh`);
      return response.data;
    } catch (error) {
      console.error('Error refreshing segment:', error);
      throw error;
    }
  }
};

export default segmentService;