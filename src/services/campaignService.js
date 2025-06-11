// In emailxp/frontend/src/services/campaignService.js

import axios from 'axios';

// Ensure this URL is correct for your deployed backend
const API_URL = 'https://emailxp-backend-production.up.railway.app/api/campaigns/';

// Helper to get auth header (same as in listService, can be refactored into a utils file later)
const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        return {
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
        };
    } else {
        return {};
    }
};

// --- Campaign Operations ---

// Get all campaigns for the user
const getCampaigns = async () => {
    const response = await axios.get(API_URL, getAuthHeader());
    return response.data;
};

// Create a new campaign
const createCampaign = async (campaignData) => {
    const response = await axios.post(API_URL, campaignData, getAuthHeader());
    return response.data;
};

// Get a single campaign by ID
const getCampaignById = async (campaignId) => {
    const response = await axios.get(API_URL + campaignId, getAuthHeader());
    return response.data;
};

// Update a campaign
const updateCampaign = async (campaignId, campaignData) => {
    const response = await axios.put(API_URL + campaignId, campaignData, getAuthHeader());
    return response.data;
};

// Delete a campaign
const deleteCampaign = async (campaignId) => {
    const response = await axios.delete(API_URL + campaignId, getAuthHeader());
    return response.data;
};

// --- New Function: Send a campaign ---
const sendCampaign = async (campaignId) => {
    const response = await axios.post(API_URL + campaignId + '/send', {}, getAuthHeader());
    return response.data;
};

// --- NEW FUNCTION: Get Open Stats for a specific campaign ---
const getCampaignOpenStats = async (campaignId) => {
    const response = await axios.get(API_URL + campaignId + '/opens', getAuthHeader());
    return response.data;
};

// --- NEW FUNCTION FOR CLICK TRACKING: Get Click Stats for a specific campaign ---
const getCampaignClickStats = async (campaignId) => {
    if (!campaignId) {
        // You could throw an error here to prevent the request from even being sent
        // throw new Error("Campaign ID is required for click stats.");
    }
    const response = await axios.get(API_URL + campaignId + '/clicks', getAuthHeader());
    return response.data;
};

const campaignService = {
    getCampaigns,
    createCampaign,
    getCampaignById,
    updateCampaign,
    deleteCampaign,
    sendCampaign,
    getCampaignOpenStats,
    getCampaignClickStats,
};

export default campaignService;