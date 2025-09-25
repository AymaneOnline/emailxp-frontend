// emailxp/frontend/src/services/userService.js

import axios from 'axios'; // Now import plain axios

const USERS_API_PATH = '/api/users';

// Get user profile
const getUserProfile = async () => {
  const response = await axios.get(USERS_API_PATH + '/profile');
  return response.data;
};

// Update user profile
const updateUserProfile = async (userData) => {
  const response = await axios.put(USERS_API_PATH + '/profile', userData);
  return response.data;
};

// Upload profile picture
const uploadProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append('profilePicture', file);
  
  const response = await axios.post(USERS_API_PATH + '/profile-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Initiate account deletion
const initiateAccountDeletion = async (password, reason = '') => {
  const response = await axios.post(USERS_API_PATH + '/initiate-deletion', { password, reason });
  return response.data;
};

// Confirm account deletion
const confirmAccountDeletion = async (token) => {
  const response = await axios.post(USERS_API_PATH + `/confirm-deletion/${token}`);
  return response.data;
};

// Cancel account deletion
const cancelAccountDeletion = async () => {
  const response = await axios.post(USERS_API_PATH + '/cancel-deletion');
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
