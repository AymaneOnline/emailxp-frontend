// emailxp/frontend/src/services/automationService.js

import api from './api';

// Get all automations
const getAutomations = async (params = {}) => {
  try {
    const response = await api.get('/automations', { params });
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) return [];
    throw new Error(error.response?.data?.message || 'Failed to fetch automations');
  }
};

// Get a specific automation by ID
const getAutomation = async (id) => {
  try {
  const response = await api.get(`/automations/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch automation');
  }
};

// Create a new automation
const createAutomation = async (automationData) => {
  try {
  const response = await api.post('/automations', automationData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create automation');
  }
};

// Update an existing automation
const updateAutomation = async (id, automationData) => {
  try {
  const response = await api.put(`/automations/${id}`, automationData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update automation');
  }
};

// Delete an automation
const deleteAutomation = async (id) => {
  try {
  const response = await api.delete(`/automations/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete automation');
  }
};

// Start an automation
const startAutomation = async (id) => {
  try {
  const response = await api.post(`/automations/${id}/start`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to start automation');
  }
};

// Pause an automation
const pauseAutomation = async (id) => {
  try {
  const response = await api.post(`/automations/${id}/pause`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to pause automation');
  }
};

// Duplicate an automation
const duplicateAutomation = async (id) => {
  try {
  const response = await api.post(`/automations/${id}/duplicate`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to duplicate automation');
  }
};

const automationService = {
  getAutomations,
  getAutomation,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  startAutomation,
  pauseAutomation,
  duplicateAutomation,
};

export default automationService;