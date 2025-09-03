// emailxp/frontend/src/services/campaignService.js

import axios from 'axios';

const CAMPAIGN_API_PATH = '/api/campaigns';

// Create axios instance with default config and auth
const campaignAPI = axios.create({
  baseURL: CAMPAIGN_API_PATH,
});

campaignAPI.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = user && user.token ? user.token : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get dashboard stats
const getDashboardStats = async (timeframe) => {
  const response = await campaignAPI.get('/dashboard-stats', { params: { timeframe } });
  return response.data;
};

// Get all campaigns
const getCampaigns = async (timeframe) => {
  const response = await campaignAPI.get('/', { params: { timeframe } });
  return response.data;
};

// Get single campaign by ID
const getCampaignById = async (campaignId) => {
  const response = await campaignAPI.get(`/${campaignId}`);
  return response.data;
};

// Create new campaign
const createCampaign = async (campaignData) => {
  const response = await campaignAPI.post('/', campaignData);
  return response.data;
};

// Update campaign
const updateCampaign = async (campaignId, campaignData) => {
  const response = await campaignAPI.put(`/${campaignId}`, campaignData);
  return response.data;
};

// Delete campaign
const deleteCampaign = async (campaignId) => {
  const response = await campaignAPI.delete(`/${campaignId}`);
  return response.data;
};

// Send test email for a campaign
const sendTestEmail = async (campaignId, recipientEmail) => {
  const response = await campaignAPI.post(`/${campaignId}/send-test`, { recipientEmail });
  return response.data;
};

// Send campaign
const sendCampaign = async (campaignId) => {
  const response = await campaignAPI.post(`/${campaignId}/send`, {});
  return response.data;
};

// Get dashboard statistics for a specific campaign
const getCampaignAnalytics = async (campaignId) => {
  const response = await campaignAPI.get(`/${campaignId}/analytics`);
  return response.data;
};

// Fetch time-series analytics for a specific campaign
const getCampaignAnalyticsTimeSeries = async (campaignId, timeframe = '7days') => {
  const response = await campaignAPI.get(`/${campaignId}/analytics/time-series`, { params: { timeframe } });
  return response.data;
};

// Export campaign report
const exportCampaignReport = async (campaignId, format = 'csv') => {
  const response = await campaignAPI.get(`/${campaignId}/export`, {
    params: { format },
    responseType: 'blob'
  });
  return response.data;
};

// Duplicate campaign
const duplicateCampaign = async (campaignId) => {
  const response = await campaignAPI.post(`/${campaignId}/duplicate`);
  return response.data;
};

// Schedule campaign
const scheduleCampaign = async (campaignId, scheduleData) => {
  const response = await campaignAPI.post(`/${campaignId}/schedule`, scheduleData);
  return response.data;
};

// Cancel scheduled campaign
const cancelScheduledCampaign = async (campaignId) => {
  const response = await campaignAPI.post(`/${campaignId}/cancel-schedule`);
  return response.data;
};

// Get campaign recipients
const getCampaignRecipients = async (campaignId, params = {}) => {
  const response = await campaignAPI.get(`/${campaignId}/recipients`, { params });
  return response.data;
};

// Get campaign activity
const getCampaignActivity = async (campaignId, params = {}) => {
  const response = await campaignAPI.get(`/${campaignId}/activity`, { params });
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
  getCampaignAnalytics,
  getCampaignAnalyticsTimeSeries,
  exportCampaignReport,
  duplicateCampaign,
  scheduleCampaign,
  cancelScheduledCampaign,
  getCampaignRecipients,
  getCampaignActivity,
};

export default campaignService;
