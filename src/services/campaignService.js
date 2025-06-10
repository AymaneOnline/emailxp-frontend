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
        // If no user/token, return an empty object for headers.
        // Axios will then send the request without an Authorization header,
        // which will likely result in a 401 error from the backend, as expected.
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
    // The endpoint is /api/campaigns/:campaignId/opens
    const response = await axios.get(API_URL + campaignId + '/opens', getAuthHeader());
    return response.data; // This will return { campaignId, totalOpens, uniqueOpens }
};

// --- NEW FUNCTION FOR CLICK TRACKING: Get Click Stats for a specific campaign ---
const getCampaignClickStats = async (campaignId) => {
    // The endpoint is /api/campaigns/:campaignId/clicks
    // Make sure your backend exposes this endpoint to provide click statistics.
    const response = await axios.get(API_URL + campaignId + '/clicks', getAuthHeader());
    // This function is expected to return data in a similar format to opens:
    // e.g., { campaignId: "someId", totalClicks: 15, uniqueClicks: 10 }
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
    getCampaignClickStats, // <--- IMPORTANT: EXPORT THE NEW CLICK STATS FUNCTION
};

export default campaignService;