// emailxp/frontend/src/services/authService.js

import axios from 'axios'; // Uses global axios configured in configureAxios

const USERS_API_PATH = (process.env.REACT_APP_BACKEND_URL || '').replace(/\/$/, '') + '/api/users';

// Register user (does not need interceptor as user is not yet logged in)
const register = async (userData) => {
  const response = await axios.post(USERS_API_PATH + '/register', userData);
  if (response.data) {
    // Registration defaults to persistent storage; user can later choose session via login
    localStorage.setItem('user', JSON.stringify(response.data));
    sessionStorage.removeItem('user');
  }
  return response.data;
};

// Login user (does not need interceptor as token is only available AFTER login)
const login = async (userData) => {
  const { remember, ...payload } = userData;
  const response = await axios.post(USERS_API_PATH + '/login', payload);
  if (response.data) {
    if (remember) {
      localStorage.setItem('user', JSON.stringify(response.data));
      sessionStorage.removeItem('user');
    } else {
      sessionStorage.setItem('user', JSON.stringify(response.data));
      localStorage.removeItem('user');
    }
  }
  return response.data;
};

// Logout user
const logout = () => {
  localStorage.removeItem('user');
  sessionStorage.removeItem('user');
};

// Send verification email (requires authentication, uses global axios with interceptor)
const sendVerificationEmail = async () => {
  const response = await axios.post(USERS_API_PATH + '/send-verification-email');
  return response.data;
};

const verifyAuth = async () => {
  const response = await axios.get(USERS_API_PATH + '/profile');
  // Update whichever storage currently holds the user
  const existingLocal = localStorage.getItem('user');
  if (existingLocal) {
    localStorage.setItem('user', JSON.stringify(response.data));
  } else if (sessionStorage.getItem('user')) {
    sessionStorage.setItem('user', JSON.stringify(response.data));
  }
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
