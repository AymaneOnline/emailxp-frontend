// emailxp/frontend/src/services/campaignService.js

import axios from 'axios';

// Use environment variable, default to local backend URL for development
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api';
const API_URL = `${API_BASE_URL}/campaigns/`; // Concatenate base URL with endpoint

const getToken = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.token;
};

// Get all campaigns
const getCampaigns = async () => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(API_URL, config);
    return response.data;
};

// Create new campaign
const createCampaign = async (campaignData) => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.post(API_URL, campaignData, config);
    return response.data;
};

// Get campaign by ID
const getCampaignById = async (id) => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(API_URL + id, config);
    return response.data;
};

// Update campaign
const updateCampaign = async (id, campaignData) => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.put(API_URL + id, campaignData, config);
    return response.data;
};

// Delete campaign
const deleteCampaign = async (id) => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.delete(API_URL + id, config);
    return response.data;
};

// Send campaign manually
const sendCampaign = async (id) => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.post(API_URL + id + '/send', {}, config);
    return response.data;
};

// --- Keep this function: Get campaign analytics ---
const getCampaignAnalytics = async (id) => {
    const token = getToken();
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.get(`${API_URL}${id}/analytics`, config);
    return response.data;
};


const campaignService = {
    getCampaigns,
    createCampaign,
    getCampaignById,
    updateCampaign,
    deleteCampaign,
    sendCampaign,
    getCampaignAnalytics, // Keep this one
};

export default campaignService;