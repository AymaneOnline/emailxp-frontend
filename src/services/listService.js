// emailxp/frontend/src/services/listService.js

import axios from 'axios';

// Ensure API_URL is just the base domain (e.g., http://localhost:5000 or https://your-backend.railway.app)
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

// Helper to construct full API URLs
const getFullApiUrl = (path) => {
    // URL constructor handles potential trailing slashes on API_BASE_URL
    return new URL(path, API_BASE_URL).toString();
};

const getLists = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const config = {
        headers: {
            Authorization: `Bearer ${user.token}`,
        },
    };
    const response = await axios.get(getFullApiUrl('/api/lists'), config);
    return response.data;
};

const createList = async (listData) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const config = {
        headers: {
            Authorization: `Bearer ${user.token}`,
        },
    };
    const response = await axios.post(getFullApiUrl('/api/lists'), listData, config);
    return response.data;
};

const getListById = async (id) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const config = {
        headers: {
            Authorization: `Bearer ${user.token}`,
        },
    };
    const response = await axios.get(getFullApiUrl(`/api/lists/${id}`), config);
    return response.data;
};

const updateList = async (id, listData) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const config = {
        headers: {
            Authorization: `Bearer ${user.token}`,
        },
    };
    const response = await axios.put(getFullApiUrl(`/api/lists/${id}`), listData, config);
    return response.data;
};

const deleteList = async (id) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const config = {
        headers: {
            Authorization: `Bearer ${user.token}`,
        },
    };
    const response = await axios.delete(getFullApiUrl(`/api/lists/${id}`), config);
    return response.data;
};

const listService = {
    getLists,
    createList,
    getListById,
    updateList,
    deleteList,
};

export default listService;