// emailxp/frontend/src/services/userManagementService.js

import axios from 'axios';

import { getBackendUrl } from '../utils/getBackendUrl';

const base = (getBackendUrl() || '').replace(/\/$/, '');
const USER_API = base ? `${base}/api/user-management` : '/api/user-management';
const ORG_API = base ? `${base}/api/organizations` : '/api/organizations';

// Create axios instance with default config and auth
const userAPI = axios.create({ baseURL: USER_API });

const orgAPI = axios.create({ baseURL: ORG_API });

// Add auth interceptor
[userAPI, orgAPI].forEach(api => {
  api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user && user.token ? user.token : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
});

const userManagementService = {
  // User Management
  getUsers: async (params = {}) => {
    try {
      const response = await userAPI.get('/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getUser: async (userId) => {
    try {
      const response = await userAPI.get(`/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      const response = await userAPI.post('/', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await userAPI.put(`/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await userAPI.delete(`/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  updateUserPermissions: async (userId, permissions) => {
    try {
      const response = await userAPI.put(`/${userId}/permissions`, { permissions });
      return response.data;
    } catch (error) {
      console.error('Error updating user permissions:', error);
      throw error;
    }
  },

  resetUserPassword: async (userId, newPassword) => {
    try {
      const response = await userAPI.post(`/${userId}/reset-password`, { newPassword });
      return response.data;
    } catch (error) {
      console.error('Error resetting user password:', error);
      throw error;
    }
  },

  generateApiKey: async (userId) => {
    try {
      const response = await userAPI.post(`/${userId}/api-key`);
      return response.data;
    } catch (error) {
      console.error('Error generating API key:', error);
      throw error;
    }
  },

  revokeApiKey: async (userId) => {
    try {
      const response = await userAPI.delete(`/${userId}/api-key`);
      return response.data;
    } catch (error) {
      console.error('Error revoking API key:', error);
      throw error;
    }
  },

  getUserActivity: async (userId, params = {}) => {
    try {
      const response = await userAPI.get(`/${userId}/activity`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching user activity:', error);
      throw error;
    }
  },

  bulkUserAction: async (action, userIds, data = {}) => {
    try {
      const response = await userAPI.post('/bulk-action', { action, userIds, data });
      return response.data;
    } catch (error) {
      console.error('Error performing bulk action:', error);
      throw error;
    }
  },

  // Organization Management
  getOrganizations: async (params = {}) => {
    try {
      const response = await orgAPI.get('/', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching organizations:', error);
      throw error;
    }
  },

  getCurrentOrganization: async () => {
    try {
      const response = await orgAPI.get('/current');
      return response.data;
    } catch (error) {
      console.error('Error fetching current organization:', error);
      throw error;
    }
  },

  getOrganization: async (organizationId) => {
    try {
      const response = await orgAPI.get(`/${organizationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching organization:', error);
      throw error;
    }
  },

  createOrganization: async (orgData) => {
    try {
      const response = await orgAPI.post('/', orgData);
      return response.data;
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  },

  updateOrganization: async (organizationId, orgData) => {
    try {
      const response = await orgAPI.put(`/${organizationId}`, orgData);
      return response.data;
    } catch (error) {
      console.error('Error updating organization:', error);
      throw error;
    }
  },

  updateSubscription: async (organizationId, subscriptionData) => {
    try {
      const response = await orgAPI.put(`/${organizationId}/subscription`, subscriptionData);
      return response.data;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  },

  getUsageStatistics: async (organizationId) => {
    try {
      const response = await orgAPI.get(`/${organizationId}/usage`);
      return response.data;
    } catch (error) {
      console.error('Error fetching usage statistics:', error);
      throw error;
    }
  },

  resetUsage: async (organizationId) => {
    try {
      const response = await orgAPI.post(`/${organizationId}/reset-usage`);
      return response.data;
    } catch (error) {
      console.error('Error resetting usage:', error);
      throw error;
    }
  },

  transferOwnership: async (organizationId, newOwnerId) => {
    try {
      const response = await orgAPI.post(`/${organizationId}/transfer-ownership`, { newOwnerId });
      return response.data;
    } catch (error) {
      console.error('Error transferring ownership:', error);
      throw error;
    }
  },

  getOrganizationMembers: async (organizationId, params = {}) => {
    try {
      const response = await orgAPI.get(`/${organizationId}/members`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching organization members:', error);
      throw error;
    }
  },

  inviteUser: async (organizationId, inviteData) => {
    try {
      const response = await orgAPI.post(`/${organizationId}/invite`, inviteData);
      return response.data;
    } catch (error) {
      console.error('Error inviting user:', error);
      throw error;
    }
  },

  removeUserFromOrganization: async (organizationId, userId) => {
    try {
      const response = await orgAPI.delete(`/${organizationId}/members/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing user from organization:', error);
      throw error;
    }
  },

  deleteOrganization: async (organizationId) => {
    try {
      const response = await orgAPI.delete(`/${organizationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting organization:', error);
      throw error;
    }
  },

  // Helper methods
  getRoles: () => [
    { value: 'super_admin', label: 'Super Admin', description: 'Full system access' },
    { value: 'admin', label: 'Admin', description: 'Organization management' },
    { value: 'manager', label: 'Manager', description: 'Team and campaign management' },
    { value: 'editor', label: 'Editor', description: 'Content creation and editing' },
    { value: 'viewer', label: 'Viewer', description: 'Read-only access' },
    { value: 'user', label: 'User', description: 'Basic user access' }
  ],

  getStatuses: () => [
    { value: 'active', label: 'Active', color: 'green' },
    { value: 'inactive', label: 'Inactive', color: 'gray' },
    { value: 'suspended', label: 'Suspended', color: 'red' },
    { value: 'pending', label: 'Pending', color: 'yellow' }
  ],

  getPlans: () => [
    { 
      value: 'free', 
      label: 'Free', 
      description: 'Basic features for small teams',
      limits: {
        users: 3,
        emailsPerMonth: 1000,
        subscribersMax: 500
      }
    },
    { 
      value: 'starter', 
      label: 'Starter', 
      description: 'Growing businesses',
      limits: {
        users: 5,
        emailsPerMonth: 5000,
        subscribersMax: 2000
      }
    },
    { 
      value: 'professional', 
      label: 'Professional', 
      description: 'Advanced features for professionals',
      limits: {
        users: 15,
        emailsPerMonth: 25000,
        subscribersMax: 10000
      }
    },
    { 
      value: 'enterprise', 
      label: 'Enterprise', 
      description: 'Full features for large organizations',
      limits: {
        users: 100,
        emailsPerMonth: 100000,
        subscribersMax: 50000
      }
    }
  ],

  getPermissionResources: () => [
    { value: 'campaigns', label: 'Campaigns' },
    { value: 'templates', label: 'Templates' },
    { value: 'subscribers', label: 'Subscribers' },
    { value: 'segments', label: 'Segments' },
    { value: 'analytics', label: 'Analytics' },
    { value: 'settings', label: 'Settings' },
    { value: 'users', label: 'Users' },
    { value: 'billing', label: 'Billing' },
    { value: 'integrations', label: 'Integrations' },
    { value: 'automation', label: 'Automation' }
  ],

  getPermissionActions: () => [
    { value: 'create', label: 'Create' },
    { value: 'read', label: 'Read' },
    { value: 'update', label: 'Update' },
    { value: 'delete', label: 'Delete' },
    { value: 'manage', label: 'Manage' }
  ],

  formatRole: (role) => {
    const roles = userManagementService.getRoles();
    const roleObj = roles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  },

  formatStatus: (status) => {
    const statuses = userManagementService.getStatuses();
    const statusObj = statuses.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  },

  getStatusColor: (status) => {
    const statuses = userManagementService.getStatuses();
    const statusObj = statuses.find(s => s.value === status);
    return statusObj ? statusObj.color : 'gray';
  },

  formatPlan: (plan) => {
    const plans = userManagementService.getPlans();
    const planObj = plans.find(p => p.value === plan);
    return planObj ? planObj.label : plan;
  },

  canManageRole: (currentRole, targetRole) => {
    const hierarchy = {
      'super_admin': 6,
      'admin': 5,
      'manager': 4,
      'editor': 3,
      'viewer': 2,
      'user': 1
    };
    
    return hierarchy[currentRole] > hierarchy[targetRole];
  },

  formatUsagePercentage: (current, limit) => {
    if (!limit || limit === 0) return 0;
    return Math.min((current / limit) * 100, 100);
  },

  getUsageColor: (percentage) => {
    if (percentage >= 90) return 'red';
    if (percentage >= 75) return 'yellow';
    if (percentage >= 50) return 'blue';
    return 'green';
  },

  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePassword: (password) => {
    return password && password.length >= 6;
  },

  generateRandomPassword: () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
};

export default userManagementService;