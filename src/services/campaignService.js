// emailxp/frontend/src/services/campaignService.js

import axios from 'axios';

// Use environment variable, default to local backend URL for development
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api';
const API_URL = `${API_BASE_URL}/campaigns/`; // Concatenate base URL with endpoint

const getToken = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.token;
};

// Helper to create config object with auth header
const getConfig = () => {
    const token = getToken();
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

// Get all campaigns
const getCampaigns = async () => {
    const response = await axios.get(API_URL, getConfig());
    return response.data;
};

// Create new campaign
const createCampaign = async (campaignData) => {
    const response = await axios.post(API_URL, campaignData, getConfig());
    return response.data;
};

// Get campaign by ID
const getCampaignById = async (id) => {
    const response = await axios.get(API_URL + id, getConfig());
    return response.data;
};

// Update campaign
const updateCampaign = async (id, campaignData) => {
    const response = await axios.put(API_URL + id, campaignData, getConfig());
    return response.data;
};

// Delete campaign
const deleteCampaign = async (id) => {
    const response = await axios.delete(API_URL + id, getConfig());
    return response.data;
};

// Send campaign manually
const sendCampaign = async (id) => {
    const response = await axios.post(API_URL + id + '/send', {}, getConfig());
    return response.data;
};

// Get campaign analytics (total/unique opens/clicks)
const getCampaignAnalytics = async (id) => {
    const response = await axios.get(`${API_URL}${id}/analytics`, getConfig());
    return response.data;
};

// Get time-series analytics (daily/weekly opens/clicks)
const getCampaignAnalyticsTimeSeries = async (id, period = 'daily') => {
    const response = await axios.get(`${API_URL}${id}/analytics/time-series?period=${period}`, getConfig());
    return response.data;
};

// NEW FUNCTION: Get dashboard stats (overall opens/clicks/rates etc.)
const getDashboardStats = async () => {
    const response = await axios.get(`${API_URL}dashboard-stats`, getConfig());
    return response.data;
};


const campaignService = {
    getCampaigns,
    createCampaign,
    getCampaignById,
    updateCampaign,
    deleteCampaign,
    sendCampaign,
    getCampaignAnalytics,
    getCampaignAnalyticsTimeSeries,
    getDashboardStats, // <-- THIS WAS MISSING! Now correctly exported.
};

export default campaignService;