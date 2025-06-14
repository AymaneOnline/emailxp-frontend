import axios from 'axios';

// Use environment variable, default to local backend URL for development
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api';
const API_URL_LISTS = `${API_BASE_URL}/lists/`; // Concatenate base URL with endpoint


const getToken = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.token;
};

// Get all lists
const getLists = async () => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(API_URL_LISTS, config);
    return response.data;
};

// Create a new list
const createList = async (listData) => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.post(API_URL_LISTS, listData, config);
    return response.data;
};

// Get list by ID
const getListById = async (id) => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(API_URL_LISTS + id, config);
    return response.data;
};

// Update list
const updateList = async (id, listData) => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.put(API_URL_LISTS + id, listData, config);
    return response.data;
};

// Delete list
const deleteList = async (id) => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.delete(API_URL_LISTS + id, config);
    return response.data;
};

// --- MODIFIED FUNCTION: Get subscribers for a list with optional filters ---
const getSubscribersByList = async (listId, filters = {}) => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        // Pass filters as query parameters using Axios's `params` option
        params: filters,
    };
    const response = await axios.get(`${API_URL_LISTS}${listId}/subscribers`, config);
    return response.data;
};

// Add a subscriber to a list
const addSubscriberToList = async (listId, subscriberData) => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.post(`${API_URL_LISTS}${listId}/subscribers`, subscriberData, config);
    return response.data;
};

// Get a single subscriber by ID within a list
const getSubscriberById = async (listId, subscriberId) => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(`${API_URL_LISTS}${listId}/subscribers/${subscriberId}`, config);
    return response.data;
};

// Update a subscriber in a list
const updateSubscriber = async (listId, subscriberId, subscriberData) => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.put(`${API_URL_LISTS}${listId}/subscribers/${subscriberId}`, subscriberData, config);
    return response.data;
};

// Delete a subscriber from a list
const deleteSubscriber = async (listId, subscriberId) => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.delete(`${API_URL_LISTS}${listId}/subscribers/${subscriberId}`, config);
    return response.data;
};


const listService = {
    getLists,
    createList,
    getListById,
    updateList,
    deleteList,
    getSubscribersByList,
    addSubscriberToList,
    getSubscriberById,
    updateSubscriber,
    deleteSubscriber,
};

export default listService;