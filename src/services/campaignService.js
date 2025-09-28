// emailxp/frontend/src/services/campaignService.js

import axios from 'axios';
import devLog from '../utils/devLog';

const CAMPAIGN_API_PATH = '/api/campaigns';
const RECOMMENDATIONS_API_PATH = '/api/recommendations';

// Get dashboard stats
const getDashboardStats = async (timeframe) => {
  const response = await axios.get(`${CAMPAIGN_API_PATH}/dashboard-stats`, { params: { timeframe } });
  return response.data;
};

// Get all campaigns
const getCampaigns = async (timeframe) => {
  try {
    const response = await axios.get(CAMPAIGN_API_PATH, { params: { timeframe } });
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) return [];
    throw error;
  }
};

// Get single campaign by ID
const getCampaignById = async (campaignId) => {
  const response = await axios.get(`${CAMPAIGN_API_PATH}/${campaignId}`);
  return response.data;
};

// Create new campaign
const createCampaign = async (campaignData) => {
  const response = await axios.post(CAMPAIGN_API_PATH, campaignData);
  return response.data;
};

// Update campaign
const updateCampaign = async (campaignId, campaignData) => {
  const response = await axios.put(`${CAMPAIGN_API_PATH}/${campaignId}`, campaignData);
  return response.data;
};

// Delete campaign
const deleteCampaign = async (campaignId) => {
  const response = await axios.delete(`${CAMPAIGN_API_PATH}/${campaignId}`);
  return response.data;
};

// Send test email for a campaign
const sendTestEmail = async (campaignId, recipientEmail) => {
  const response = await axios.post(`${CAMPAIGN_API_PATH}/${campaignId}/send-test`, { recipientEmail });
  return response.data;
};

// Send campaign
const sendCampaign = async (campaignId) => {
  const response = await axios.post(`${CAMPAIGN_API_PATH}/${campaignId}/send`, {});
  return response.data;
};

// Get dashboard statistics for a specific campaign
const getCampaignAnalytics = async (campaignId) => {
  const response = await axios.get(`${CAMPAIGN_API_PATH}/${campaignId}/analytics`);
  return response.data;
};

// Fetch time-series analytics for a specific campaign
const getCampaignAnalyticsTimeSeries = async (campaignId, timeframe = '7days') => {
  const response = await axios.get(`${CAMPAIGN_API_PATH}/${campaignId}/analytics/time-series`, { params: { timeframe } });
  return response.data;
};

// Export campaign report
const exportCampaignReport = async (campaignId, format = 'csv') => {
  const response = await axios.get(`${CAMPAIGN_API_PATH}/${campaignId}/export`, {
    params: { format },
    responseType: 'blob'
  });
  return response.data;
};

// Duplicate campaign
const duplicateCampaign = async (campaignId) => {
  const response = await axios.post(`${CAMPAIGN_API_PATH}/${campaignId}/duplicate`);
  return response.data;
};

// Schedule campaign
const scheduleCampaign = async (campaignId, scheduleData) => {
  const response = await axios.post(`${CAMPAIGN_API_PATH}/${campaignId}/schedule`, scheduleData);
  return response.data;
};

// Cancel scheduled campaign
const cancelScheduledCampaign = async (campaignId) => {
  const response = await axios.post(`${CAMPAIGN_API_PATH}/${campaignId}/cancel-schedule`);
  return response.data;
};

// Get campaign recipients
const getCampaignRecipients = async (campaignId, params = {}) => {
  const response = await axios.get(`${CAMPAIGN_API_PATH}/${campaignId}/recipients`, { params });
  return response.data;
};

// Get campaign activity
const getCampaignActivity = async (campaignId, params = {}) => {
  const response = await axios.get(`${CAMPAIGN_API_PATH}/${campaignId}/activity`, { params });
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

  // Get recommended campaigns for a subscriber
  getRecommendedCampaigns: async (subscriberId, limit = 5) => {
    try {
      const response = await axios.get(`${RECOMMENDATIONS_API_PATH}/subscriber/${subscriberId}`, {
        params: { limit, contentType: 'campaign' }
      });
      return response.data;
    } catch (error) {
      devLog('Error fetching recommended campaigns:', error);
      throw error;
    }
  },

  // Get personalized campaign for a subscriber
  getPersonalizedCampaign: async (subscriberId) => {
    try {
      const response = await axios.get(`${RECOMMENDATIONS_API_PATH}/personalized/${subscriberId}`, {
        params: { contentType: 'campaign' }
      });
      return response.data;
    } catch (error) {
      devLog('Error fetching personalized campaign:', error);
      throw error;
    }
  },

  // Record feedback for campaign recommendations
  recordCampaignFeedback: async (feedbackData) => {
    try {
      const response = await axios.post(`${RECOMMENDATIONS_API_PATH}/feedback`, feedbackData);
      return response.data;
    } catch (error) {
      devLog('Error recording campaign feedback:', error);
      throw error;
    }
  },

  // Get subscriber engagement profile
  getSubscriberEngagementProfile: async (subscriberId) => {
    try {
      const response = await axios.get(`${RECOMMENDATIONS_API_PATH}/profile/${subscriberId}`);
      return response.data;
    } catch (error) {
      devLog('Error fetching subscriber engagement profile:', error);
      throw error;
    }
  }
};

export default campaignService;
