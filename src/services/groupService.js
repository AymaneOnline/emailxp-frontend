// emailxp/frontend/src/services/groupService.js

import axios from 'axios';

const GROUP_API_PATH = '/api/groups';

// Get all groups (gracefully handle 403 during onboarding)
const getGroups = async () => {
  try {
    const response = await axios.get(GROUP_API_PATH);
    // Backend returns an array of groups. In some onboarding cases an object
    // like { groups: [] } may be returned. Normalize to always return an array.
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.groups)) return response.data.groups;
    return [];
  } catch(err){
    if(err?.response?.status === 403) return [];
    throw err;
  }
};

// Get a single group by ID
const getGroupById = async (groupId) => {
  try {
    const response = await axios.get(`${GROUP_API_PATH}/${groupId}`);
    return response.data;
  } catch(err){
    if(err?.response?.status === 403) return null;
    throw err;
  }
};

// Create a new group
const createGroup = async (groupData) => {
  try {
    const response = await axios.post(GROUP_API_PATH, groupData);
    return response.data;
  } catch(err){
    if(err?.response?.status === 403) return null;
    throw err;
  }
};

// Update a group
const updateGroup = async (groupId, groupData) => {
  try {
    const response = await axios.put(`${GROUP_API_PATH}/${groupId}`, groupData);
    return response.data;
  } catch(err){
    if(err?.response?.status === 403) return null;
    throw err;
  }
};

// Delete a group
const deleteGroup = async (groupId) => {
  try {
    const response = await axios.delete(`${GROUP_API_PATH}/${groupId}`);
    return response.data;
  } catch(err){
    if(err?.response?.status === 403) return null;
    throw err;
  }
};

const groupService = {
  getGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
};

export default groupService;