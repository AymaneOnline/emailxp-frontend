// emailxp/frontend/src/services/campaignService.js

import axios from 'axios';

// TOP LEVEL LOG:
console.log('campaignService.js (Module Load): REACT_APP_BACKEND_URL =', process.env.REACT_APP_BACKEND_URL);

// Ensure API_BASE_URL is just the base domain (e.g., http://localhost:5000 or https://your-backend.railway.app)
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
console.log('campaignService.js: Derived API_BASE_URL =', API_BASE_URL); // LOG

// Helper to construct full API URLs
const getFullApiUrl = (path) => {
    // URL constructor handles potential trailing slashes on API_BASE_URL
    const fullUrl = new URL(path, API_BASE_URL).toString();
    console.log(`campaignService.js: Constructing URL - Path: ${path}, Base: ${API_BASE_URL}, Full: ${fullUrl}`); // LOG
    return fullUrl;
};


const getCampaigns = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const config = {
        headers: {
            Authorization: `Bearer ${user.token}`,
        },
    };
    const response = await axios.get(getFullApiUrl('/api/campaigns'), config);
    return response.data;
};

const createCampaign = async (campaignData) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const config = {
        headers: {
            Authorization: `Bearer ${user.token}`,
        },
    };
    const response = await axios.post(getFullApiUrl('/api/campaigns'), campaignData, config);
    return response.data;
};

const getCampaignById = async (id) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const config = {
        headers: {
            Authorization: `Bearer ${user.token}`,
        },
    };
    const response = await axios.get(getFullApiUrl(`/api/campaigns/${id}`), config);
    return response.data;
};

const updateCampaign = async (id, campaignData) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const config = {
        headers: {
            Authorization: `Bearer ${user.token}`,
        },
    };
    const response = await axios.put(getFullApiUrl(`/api/campaigns/${id}`), campaignData, config);
    return response.data;
};

const deleteCampaign = async (id) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const config = {
        headers: {
            Authorization: `Bearer ${user.token}`,
        },
    };
    const response = await axios.delete(getFullApiUrl(`/api/campaigns/${id}`), config);
    return response.data;
};

const sendTestEmail = async (campaignId, recipientEmail) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const config = {
        headers: {
            Authorization: `Bearer ${user.token}`,
        },
    };
    const response = await axios.post(getFullApiUrl(`/api/campaigns/${campaignId}/send-test`), { recipientEmail }, config);
    return response.data;
};

const sendCampaign = async (campaignId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const config = {
        headers: {
            Authorization: `Bearer ${user.token}`,
        },
    };
    const response = await axios.post(getFullApiUrl(`/api/campaigns/${campaignId}/send`), {}, config);
    return response.data;
};

const getDashboardStats = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const config = {
        headers: {
            Authorization: `Bearer ${user.token}`,
        },
    };
    // FIX: Use getFullApiUrl for dashboard-stats
    const response = await axios.get(getFullApiUrl('/api/campaigns/dashboard-stats'), config);
    return response.data;
};

const campaignService = {
    getCampaigns,
    createCampaign,
    getCampaignById,
    updateCampaign,
    deleteCampaign,
    sendTestEmail,
    sendCampaign,
    getDashboardStats,
};

export default campaignService;