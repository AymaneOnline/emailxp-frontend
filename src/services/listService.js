import axios from 'axios';

const API_URL = 'https://emailxp-backend-production.up.railway.app/api/lists/';

// Helper to get auth header
const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        return {
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
        };
    } else {
        return {}; // Return empty object if no token, implies unauthorized request
    }
};

// --- List Operations ---

// Get all lists for the user
const getLists = async () => {
    const response = await axios.get(API_URL, getAuthHeader());
    return response.data;
};

// Create a new list
const createList = async (listData) => {
    const response = await axios.post(API_URL, listData, getAuthHeader());
    return response.data;
};

// Get a single list by ID
const getListById = async (listId) => {
    const response = await axios.get(API_URL + listId, getAuthHeader());
    return response.data;
};

// Update a list
const updateList = async (listId, listData) => {
    const response = await axios.put(API_URL + listId, listData, getAuthHeader());
    return response.data;
};

// Delete a list
const deleteList = async (listId) => {
    const response = await axios.delete(API_URL + listId, getAuthHeader());
    return response.data;
};

// --- Subscriber Operations ---

// Get all subscribers for a specific list
const getSubscribers = async (listId) => {
    const response = await axios.get(API_URL + listId + '/subscribers', getAuthHeader());
    return response.data;
};

// Add a new subscriber to a list
const addSubscriber = async (listId, subscriberData) => {
    const response = await axios.post(API_URL + listId + '/subscribers', subscriberData, getAuthHeader());
    return response.data;
};

// Update a subscriber in a list
const updateSubscriber = async (listId, subscriberId, subscriberData) => {
    const response = await axios.put(API_URL + listId + '/subscribers/' + subscriberId, subscriberData, getAuthHeader());
    return response.data;
};

// Delete a subscriber from a list
const deleteSubscriber = async (listId, subscriberId) => {
    const response = await axios.delete(API_URL + listId + '/subscribers/' + subscriberId, getAuthHeader());
    return response.data;
};


const listService = {
    getLists,
    createList,
    getListById,
    updateList,
    deleteList,
    getSubscribers,
    addSubscriber,
    updateSubscriber,
    deleteSubscriber,
};

export default listService;