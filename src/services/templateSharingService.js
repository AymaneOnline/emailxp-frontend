// emailxp/frontend/src/services/templateSharingService.js

import axios from 'axios';

import { getBackendUrl } from '../utils/getBackendUrl';

const base = (getBackendUrl() || '').replace(/\/$/, '');
const SHARING_API = base ? `${base}/api/template-sharing` : '/api/template-sharing';
// Create axios instance with default config and auth
const sharingAPI = axios.create({ baseURL: SHARING_API });

sharingAPI.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = user && user.token ? user.token : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const templateSharingService = {
  // Share template with users
  shareTemplate: async (templateId, emails, permissions = 'view') => {
    try {
      const response = await sharingAPI.post(`/${templateId}/share`, {
        userEmails: emails,
        permissions
      });
      return response.data;
    } catch (error) {
      console.error('Error sharing template:', error);
      throw error;
    }
  },

  // Get templates shared with current user
  getSharedWithMe: async () => {
    try {
      const response = await sharingAPI.get('/shared-with-me');
      return response.data;
    } catch (error) {
      console.error('Error fetching shared templates:', error);
      throw error;
    }
  },

  // Get templates shared by current user
  getSharedByMe: async () => {
    try {
      const response = await sharingAPI.get('/shared-by-me');
      return response.data;
    } catch (error) {
      console.error('Error fetching shared templates:', error);
      throw error;
    }
  },

  // Update sharing permissions
  updatePermissions: async (templateId, userId, permissions) => {
    try {
      const response = await sharingAPI.put(`/${templateId}/share/${userId}`, {
        permissions
      });
      return response.data;
    } catch (error) {
      console.error('Error updating permissions:', error);
      throw error;
    }
  },

  // Remove sharing access
  removeAccess: async (templateId, userId) => {
    try {
      const response = await sharingAPI.delete(`/${templateId}/share/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing access:', error);
      throw error;
    }
  },

  // Make template public
  makePublic: async (templateId) => {
    try {
      const response = await sharingAPI.post(`/${templateId}/make-public`);
      return response.data;
    } catch (error) {
      console.error('Error making template public:', error);
      throw error;
    }
  },

  // Make template private
  makePrivate: async (templateId) => {
    try {
      const response = await sharingAPI.post(`/${templateId}/make-private`);
      return response.data;
    } catch (error) {
      console.error('Error making template private:', error);
      throw error;
    }
  },

  // Get public templates
  getPublicTemplates: async (params = {}) => {
    try {
      const response = await sharingAPI.get('/public', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching public templates:', error);
      throw error;
    }
  },

  // Get template sharing details
  getTemplateShares: async (templateId) => {
    try {
      // This would typically be a separate endpoint, but for now we'll use the template service
      const response = await axios.get(`/api/templates/${templateId}`, {
        headers: {
          Authorization: `Bearer ${JSON.parse(localStorage.getItem('user'))?.token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching template shares:', error);
      throw error;
    }
  }
};

export default templateSharingService;