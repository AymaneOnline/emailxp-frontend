import axios from 'axios';

const TAG_API_PATH = '/api/tags';

const tagAPI = axios.create({
  baseURL: TAG_API_PATH,
});

// Add auth token to requests
tagAPI.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Get all tags
const getTags = async () => {
  const response = await tagAPI.get('/');
  return response.data;
};

// Create a new tag
const createTag = async (tagData) => {
  const response = await tagAPI.post('/', tagData);
  return response.data;
};

// Update a tag
const updateTag = async (id, tagData) => {
  const response = await tagAPI.put(`/${id}`, tagData);
  return response.data;
};

// Delete a tag
const deleteTag = async (id) => {
  const response = await tagAPI.delete(`/${id}`);
  return response.data;
};

// Clean up unused tags
const cleanupUnusedTags = async () => {
  const response = await tagAPI.delete('/cleanup');
  return response.data;
};

const tagService = {
  getTags,
  createTag,
  updateTag,
  deleteTag,
  cleanupUnusedTags,
};

export default tagService;
