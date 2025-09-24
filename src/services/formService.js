// emailxp/frontend/src/services/formService.js

import api from './api';

const formService = {
  // Get all forms
  getForms: async () => {
    try {
      const response = await api.get('/forms');
      return response.data;
    } catch (error) {
      const status = error.response?.status;
      if (status === 404) return { forms: [] };
      if (status === 403) return { forms: [] };
      throw new Error(error.response?.data?.message || 'Failed to fetch forms');
    }
  },

  // Get form by ID
  getFormById: async (id) => {
    try {
      const response = await api.get(`/forms/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch form');
    }
  },

  // Create a new form
  createForm: async (formData) => {
    try {
      const response = await api.post('/forms', formData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create form');
    }
  },

  // Update form
  updateForm: async (id, formData) => {
    try {
      const response = await api.put(`/forms/${id}`, formData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update form');
    }
  },

  // Delete form
  deleteForm: async (id) => {
    try {
      const response = await api.delete(`/forms/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete form');
    }
  },

  // Get form submissions
  getFormSubmissions: async (formId) => {
    try {
      const response = await api.get(`/forms/${formId}/submissions`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch form submissions');
    }
  }
};

export default formService;