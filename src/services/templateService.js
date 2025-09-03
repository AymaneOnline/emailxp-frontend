// emailxp/frontend/src/services/templateService.js

import axios from 'axios';

const TEMPLATES_API_PATH = '/api/templates';

// Create axios instance with default config and auth
const templateAPI = axios.create({
  baseURL: TEMPLATES_API_PATH,
});

templateAPI.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = user && user.token ? user.token : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const templateService = {
  // Get all templates
  getTemplates: async (params = {}) => {
    try {
      const response = await templateAPI.get('/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },

  // Get popular templates
  getPopularTemplates: async (limit = 10) => {
    try {
      const response = await templateAPI.get('/popular', { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('Error fetching popular templates:', error);
      throw error;
    }
  },

  // Get templates by category
  getTemplatesByCategory: async (category) => {
    try {
      const response = await templateAPI.get(`/category/${category}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching templates by category:', error);
      throw error;
    }
  },

  // Get a specific template by ID
  getTemplateById: async (id) => {
    try {
      const response = await templateAPI.get(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching template:', error);
      throw error;
    }
  },

  // Create a new template
  createTemplate: async (templateData) => {
    try {
      const response = await templateAPI.post('/', templateData);
      return response.data;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },

  // Update an existing template
  updateTemplate: async (id, templateData) => {
    try {
      const response = await templateAPI.put(`/${id}`, templateData);
      return response.data;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  },

  // Delete a template
  deleteTemplate: async (id) => {
    try {
      const response = await templateAPI.delete(`/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  },

  // Duplicate a template
  duplicateTemplate: async (id) => {
    try {
      const response = await templateAPI.post(`/${id}/duplicate`);
      return response.data;
    } catch (error) {
      console.error('Error duplicating template:', error);
      throw error;
    }
  },

  // Use a template (increment usage stats)
  useTemplate: async (id) => {
    try {
      const response = await templateAPI.post(`/${id}/use`);
      return response.data;
    } catch (error) {
      console.error('Error using template:', error);
      throw error;
    }
  },

  // Get template preview URL
  getPreviewUrl: (id) => {
    return `${templateAPI.defaults.baseURL}/${id}/preview`;
  },

  // Duplicate template
  duplicateTemplate: async (id) => {
    try {
      const response = await templateAPI.post(`/${id}/duplicate`);
      return response.data;
    } catch (error) {
      console.error('Error duplicating template:', error);
      throw error;
    }
  },

  // Export template
  exportTemplate: async (id) => {
    try {
      const response = await templateAPI.get(`/${id}/export`);
      return response.data;
    } catch (error) {
      console.error('Error exporting template:', error);
      throw error;
    }
  },

  // Import template
  importTemplate: async (templateData) => {
    try {
      const response = await templateAPI.post('/import', templateData);
      return response.data;
    } catch (error) {
      console.error('Error importing template:', error);
      throw error;
    }
  },

  // Get template categories
  getCategories: async () => {
    try {
      const response = await templateAPI.get('/meta/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }
};

export default templateService;