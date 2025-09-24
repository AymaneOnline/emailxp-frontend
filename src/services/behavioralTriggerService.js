// emailxp/frontend/src/services/behavioralTriggerService.js

import api from './api';

const behavioralTriggerService = {
  // Get all behavioral triggers
  getAllTriggers: async (params = {}) => {
    const response = await api.get('/behavioral-triggers', { params });
    return response.data;
  },

  // Get specific behavioral trigger
  getTriggerById: async (id) => {
    const response = await api.get(`/behavioral-triggers/${id}`);
    return response.data;
  },

  // Create new behavioral trigger
  createTrigger: async (triggerData) => {
    const response = await api.post('/behavioral-triggers', triggerData);
    return response.data;
  },

  // Update behavioral trigger
  updateTrigger: async (id, triggerData) => {
    const response = await api.put(`/behavioral-triggers/${id}`, triggerData);
    return response.data;
  },

  // Delete behavioral trigger
  deleteTrigger: async (id) => {
    const response = await api.delete(`/behavioral-triggers/${id}`);
    return response.data;
  },

  // Toggle trigger active status
  toggleTrigger: async (id) => {
    const response = await api.post(`/behavioral-triggers/${id}/toggle`);
    return response.data;
  },

  // Get trigger statistics
  getStats: async () => {
    const response = await api.get('/behavioral-triggers/stats');
    return response.data;
  },

  // Test trigger
  testTrigger: async (id) => {
    const response = await api.post(`/behavioral-triggers/${id}/test`);
    return response.data;
  },

  // Track behavioral event
  trackEvent: async (eventData) => {
    const response = await api.post('/behavioral-events/track', eventData);
    return response.data;
  },

  // Get subscriber events
  getSubscriberEvents: async (subscriberId, params = {}) => {
    const response = await api.get(`/behavioral-events/subscriber/${subscriberId}`, { params });
    return response.data;
  },

  // Get all events
  getAllEvents: async (params = {}) => {
    const response = await api.get('/behavioral-events', { params });
    return response.data;
  },

  // Get event statistics
  getEventStats: async (params = {}) => {
    const response = await api.get('/behavioral-events/stats', { params });
    return response.data;
  }
};

export default behavioralTriggerService;