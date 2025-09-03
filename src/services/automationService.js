// emailxp/frontend/src/services/automationService.js

import api from './api';

const automationService = {
  // Get all automations
  getAutomations: async (params = {}) => {
    try {
      const response = await api.get('/automations', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching automations:', error);
      throw error;
    }
  },

  // Get automation by ID
  getAutomation: async (id) => {
    try {
      const response = await api.get(`/automations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching automation:', error);
      throw error;
    }
  },

  // Create new automation
  createAutomation: async (automationData) => {
    try {
      const response = await api.post('/automations', automationData);
      return response.data;
    } catch (error) {
      console.error('Error creating automation:', error);
      throw error;
    }
  },

  // Update automation
  updateAutomation: async (id, automationData) => {
    try {
      const response = await api.put(`/automations/${id}`, automationData);
      return response.data;
    } catch (error) {
      console.error('Error updating automation:', error);
      throw error;
    }
  },

  // Delete automation
  deleteAutomation: async (id) => {
    try {
      const response = await api.delete(`/automations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting automation:', error);
      throw error;
    }
  },

  // Activate/Deactivate automation
  toggleAutomation: async (id, isActive) => {
    try {
      const response = await api.patch(`/automations/${id}/toggle`, { isActive });
      return response.data;
    } catch (error) {
      console.error('Error toggling automation:', error);
      throw error;
    }
  },

  // Get automation analytics
  getAutomationAnalytics: async (id, timeRange = '30d') => {
    try {
      const response = await api.get(`/automations/${id}/analytics`, {
        params: { timeRange }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching automation analytics:', error);
      throw error;
    }
  },

  // Test automation
  testAutomation: async (id, testData) => {
    try {
      const response = await api.post(`/automations/${id}/test`, testData);
      return response.data;
    } catch (error) {
      console.error('Error testing automation:', error);
      throw error;
    }
  },

  // Get automation triggers
  getTriggers: async () => {
    try {
      const response = await api.get('/automations/triggers');
      return response.data;
    } catch (error) {
      console.error('Error fetching triggers:', error);
      throw error;
    }
  },

  // Get automation actions
  getActions: async () => {
    try {
      const response = await api.get('/automations/actions');
      return response.data;
    } catch (error) {
      console.error('Error fetching actions:', error);
      throw error;
    }
  },

  // Duplicate automation
  duplicateAutomation: async (id) => {
    try {
      const response = await api.post(`/automations/${id}/duplicate`);
      return response.data;
    } catch (error) {
      console.error('Error duplicating automation:', error);
      throw error;
    }
  },

  // Get automation logs
  getAutomationLogs: async (id, params = {}) => {
    try {
      const response = await api.get(`/automations/${id}/logs`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching automation logs:', error);
      throw error;
    }
  },

  // Get automation subscribers
  getAutomationSubscribers: async (id, params = {}) => {
    try {
      const response = await api.get(`/automations/${id}/subscribers`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching automation subscribers:', error);
      throw error;
    }
  }
};

export default automationService;