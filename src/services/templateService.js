// emailxp/frontend/src/services/templateService.js

import axios from 'axios';

const TEMPLATES_API_PATH = '/api/templates';

const templateService = {
  // Get all templates
  getTemplates: async (params = {}) => {
    try {
      const response = await axios.get(TEMPLATES_API_PATH, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },

  // Get popular templates
  getPopularTemplates: async (limit = 10) => {
    try {
      const response = await axios.get(`${TEMPLATES_API_PATH}/popular`, { params: { limit } });
      return response.data;
    } catch (error) {
      console.error('Error fetching popular templates:', error);
      throw error;
    }
  },

  // Get templates by category
  getTemplatesByCategory: async (category) => {
    try {
      const response = await axios.get(`${TEMPLATES_API_PATH}/category/${category}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching templates by category:', error);
      throw error;
    }
  },

  // Get a specific template by ID
  getTemplateById: async (id) => {
    try {
      const response = await axios.get(`${TEMPLATES_API_PATH}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching template:', error);
      throw error;
    }
  },

  // Create a new template
  createTemplate: async (templateData) => {
    try {
      const response = await axios.post(TEMPLATES_API_PATH, templateData);
      return response.data;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },

  // Update an existing template
  updateTemplate: async (id, templateData) => {
    try {
      const response = await axios.put(`${TEMPLATES_API_PATH}/${id}`, templateData);
      return response.data;
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  },

  // Delete a template
  deleteTemplate: async (id) => {
    try {
      const response = await axios.delete(`${TEMPLATES_API_PATH}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  },

  // Duplicate a template
  duplicateTemplate: async (id) => {
    try {
      const response = await axios.post(`${TEMPLATES_API_PATH}/${id}/duplicate`);
      return response.data;
    } catch (error) {
      console.error('Error duplicating template:', error);
      throw error;
    }
  },

  // Use a template (increment usage stats)
  useTemplate: async (id) => {
    try {
      const response = await axios.post(`${TEMPLATES_API_PATH}/${id}/use`);
      return response.data;
    } catch (error) {
      console.error('Error using template:', error);
      throw error;
    }
  },

  // Get template preview URL
  getPreviewUrl: (id) => {
    return `${TEMPLATES_API_PATH}/${id}/preview`;
  },

  // Export template
  exportTemplate: async (id) => {
    try {
      const response = await axios.get(`${TEMPLATES_API_PATH}/${id}/export`);
      return response.data;
    } catch (error) {
      console.error('Error exporting template:', error);
      throw error;
    }
  },

  // Import template
  importTemplate: async (templateData) => {
    try {
      const response = await axios.post(`${TEMPLATES_API_PATH}/import`, templateData);
      return response.data;
    } catch (error) {
      console.error('Error importing template:', error);
      throw error;
    }
  },

  // Get template categories
  getCategories: async () => {
    try {
      const response = await axios.get(`${TEMPLATES_API_PATH}/meta/categories`);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get recommended templates for a subscriber
  getRecommendedTemplates: async (subscriberId, limit = 10) => {
    try {
      const response = await axios.get(`/api/recommendations/subscriber/${subscriberId}`, {
        params: { limit, contentType: 'template' }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recommended templates:', error);
      throw error;
    }
  },

  // Get personalized template for a subscriber
  getPersonalizedTemplate: async (subscriberId) => {
    try {
      const response = await axios.get(`/api/recommendations/personalized/${subscriberId}`, {
        params: { contentType: 'template' }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching personalized template:', error);
      throw error;
    }
  },

  // Record feedback for template recommendations
  recordTemplateFeedback: async (feedbackData) => {
    try {
      const response = await axios.post('/api/recommendations/feedback', feedbackData);
      return response.data;
    } catch (error) {
      console.error('Error recording template feedback:', error);
      throw error;
    }
  }
};

export default templateService;