// emailxp/frontend/src/services/authService.js

import axios from 'axios'; // Now import plain axios, it will be configured globally

const USERS_API_PATH = '/users';

// Register user (does not need interceptor as user is not yet logged in, but uses global baseURL)
const register = async (userData) => {
  const response = await axios.post(USERS_API_PATH + '/register', userData);
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// Login user (does not need interceptor as token is only available AFTER login, but uses global baseURL)
const login = async (userData) => {
  const response = await axios.post(USERS_API_PATH + '/login', userData);
  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
};

// Send verification email (requires authentication, uses global axios with interceptor)
const sendVerificationEmail = async () => {
  const response = await axios.post(USERS_API_PATH + '/send-verification-email');
  return response.data;
};

const verifyAuth = async () => {
  const response = await axios.get(USERS_API_PATH + '/profile');
  return response.data;
};

const authService = {
  register,
  login,
  logout,
  sendVerificationEmail,
  verifyAuth,
};

export default authService;
