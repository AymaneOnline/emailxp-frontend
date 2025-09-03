// emailxp/frontend/src/services/groupService.js

import axios from 'axios';

const GROUP_API_PATH = '/api/groups';

// Create axios instance with default config
const groupAPI = axios.create({
    baseURL: GROUP_API_PATH,
});

// Add auth token to requests
groupAPI.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = user && user.token ? user.token : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get all groups
const getGroups = async () => {
  const response = await groupAPI.get('/');
  return response.data;
};

// Get a single group by ID
const getGroupById = async (groupId) => {
  const response = await groupAPI.get(`/${groupId}`);
  return response.data;
};

// Create a new group
const createGroup = async (groupData) => {
  const response = await groupAPI.post('/', groupData);
  return response.data;
};

// Update a group
const updateGroup = async (groupId, groupData) => {
  const response = await groupAPI.put(`/${groupId}`, groupData);
  return response.data;
};

// Delete a group
const deleteGroup = async (groupId) => {
  const response = await groupAPI.delete(`/${groupId}`);
  return response.data;
};

const groupService = {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
};

export default groupService;