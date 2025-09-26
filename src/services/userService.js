// emailxp/frontend/src/services/userService.js
// Use the shared axios instance (api) which injects auth token & correct baseURL
import api from './api';

// All endpoints here are authenticated; using api ensures Authorization header is added.

// Get user profile
const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

// Update user profile
const updateUserProfile = async (userData) => {
  const response = await api.put('/users/profile', userData);
  return response.data;
};

// Upload profile picture
const uploadProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append('profilePicture', file);
  
  const response = await api.post('/users/profile-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Initiate account deletion
const initiateAccountDeletion = async (password, reason = '') => {
  const response = await api.post('/users/initiate-deletion', { password, reason });
  return response.data;
};

// Confirm account deletion
const confirmAccountDeletion = async (token) => {
  const response = await api.post(`/users/confirm-deletion/${token}`);
  return response.data;
};

// Cancel account deletion
const cancelAccountDeletion = async () => {
  const response = await api.post('/users/cancel-deletion');
  return response.data;
};

const userService = {
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  initiateAccountDeletion,
  confirmAccountDeletion,
  cancelAccountDeletion,
};

export default userService;
