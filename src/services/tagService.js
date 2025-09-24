import axios from 'axios';
import { getAuthToken } from '../utils/authToken';

const base = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
const TAG_API = base ? `${base}/api/tags` : '/api/tags';
const tagAPI = axios.create({ baseURL: TAG_API });

// Add auth token to requests
tagAPI.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Get all tags
const getTags = async () => {
  try {
    const response = await tagAPI.get('/');
    return response.data;
  } catch(err){
    if(err?.response?.status === 403) return { tags: [] };
    throw err;
  }
};

// Create a new tag
const createTag = async (tagData) => {
  try {
    const response = await tagAPI.post('/', tagData);
    return response.data;
  } catch(err){
    if(err?.response?.status === 403) return null;
    throw err;
  }
};

// Update a tag
const updateTag = async (id, tagData) => {
  try {
    const response = await tagAPI.put(`/${id}`, tagData);
    return response.data;
  } catch(err){
    if(err?.response?.status === 403) return null;
    throw err;
  }
};

// Delete a tag
const deleteTag = async (id) => {
  try {
    const response = await tagAPI.delete(`/${id}`);
    return response.data;
  } catch(err){
    if(err?.response?.status === 403) return null;
    throw err;
  }
};

// Clean up unused tags
const cleanupUnusedTags = async () => {
  try {
    const response = await tagAPI.delete('/cleanup');
    return response.data;
  } catch(err){
    if(err?.response?.status === 403) return null;
    throw err;
  }
};

const tagService = {
  getTags,
  createTag,
  updateTag,
  deleteTag,
  cleanupUnusedTags,
};

export default tagService;
