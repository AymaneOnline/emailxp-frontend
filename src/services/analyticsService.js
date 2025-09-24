// emailxp/frontend/src/services/analyticsService.js

import axios from 'axios';
import { getAuthToken } from '../utils/authToken';

const base = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
const ANALYTICS_API = base ? `${base}/api/analytics` : '/api/analytics';

// Create axios instance with default config and auth
const analyticsAPI = axios.create({
  baseURL: ANALYTICS_API,
});

analyticsAPI.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const analyticsService = {
  // Get dashboard overview
  getDashboardOverview: async (timeframe = '30d') => {
    try {
      const response = await analyticsAPI.get('/dashboard', {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      if (error?.response?.status === 403) {
        // Suppress onboarding noise: unverified/incomplete profiles will 403
        return null;
      }
      console.error('Error fetching dashboard overview:', error);
      throw error;
    }
  },

  // Get campaign analytics
  getCampaignAnalytics: async (campaignId, timeframe = '30d') => {
    try {
      const response = await analyticsAPI.get(`/campaigns/${campaignId}`, {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching campaign analytics:', error);
      throw error;
    }
  },

  // Get all campaigns analytics
  getCampaignsAnalytics: async (params = {}) => {
    try {
      const response = await analyticsAPI.get('/campaigns', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching campaigns analytics:', error);
      throw error;
    }
  },

  // Get template analytics
  getTemplateAnalytics: async (templateId, timeframe = '30d') => {
    try {
      const response = await analyticsAPI.get(`/templates/${templateId}`, {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching template analytics:', error);
      throw error;
    }
  },

  // Get subscriber analytics
  getSubscriberAnalytics: async (timeframe = '30d') => {
    try {
      const response = await analyticsAPI.get('/subscribers', {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching subscriber analytics:', error);
      throw error;
    }
  },

  // Get engagement analytics
  getEngagementAnalytics: async (timeframe = '30d', groupBy = 'day') => {
    try {
      const response = await analyticsAPI.get('/engagement', {
        params: { timeframe, groupBy }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching engagement analytics:', error);
      throw error;
    }
  },

  // Get geographic analytics
  getGeographicAnalytics: async (timeframe = '30d') => {
    try {
      const response = await analyticsAPI.get('/geography', {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching geographic analytics:', error);
      throw error;
    }
  },

  // Get link performance analytics
  getLinkPerformance: async (timeframe = '30d', campaignId = null) => {
    try {
      const params = { timeframe };
      if (campaignId) params.campaignId = campaignId;
      
      const response = await analyticsAPI.get('/links', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching link performance:', error);
      throw error;
    }
  },

  // Get comparative analytics
  getComparativeAnalytics: async (entities, timeframe = '30d') => {
    try {
      const response = await analyticsAPI.get('/compare', {
        params: { entities, timeframe }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching comparative analytics:', error);
      throw error;
    }
  },

  // Generate analytics report
  generateReport: async (reportConfig) => {
    try {
      const response = await analyticsAPI.post('/reports', reportConfig);
      return response.data;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  },

  // Trigger analytics generation
  generateAnalytics: async (entityType, entityId, period = 'day') => {
    try {
      const response = await analyticsAPI.post(`/generate/${entityType}/${entityId}`, {
        period
      });
      return response.data;
    } catch (error) {
      console.error('Error generating analytics:', error);
      throw error;
    }
  },

  // Helper methods for data formatting and calculations
  formatMetric: (value, type = 'number') => {
    if (value === null || value === undefined) return 'N/A';
    
    switch (type) {
      case 'percentage':
        return `${Number(value).toFixed(2)}%`;
      case 'currency':
        return `$${Number(value).toFixed(2)}`;
      case 'number':
        return Number(value).toLocaleString();
      case 'decimal':
        return Number(value).toFixed(2);
      default:
        return value;
    }
  },

  calculateGrowth: (current, previous) => {
    if (!previous || previous === 0) {
      return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
  },

  getGrowthColor: (growth) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  },

  getGrowthIcon: (growth) => {
    if (growth > 0) return 'TrendingUp';
    if (growth < 0) return 'TrendingDown';
    return 'Minus';
  },

  // Chart data formatters
  formatChartData: (data, xKey, yKey, label = 'Value') => {
    return data.map(item => ({
      x: item[xKey],
      y: item[yKey],
      label: label
    }));
  },

  formatTimeSeriesData: (data, dateKey, valueKey, label = 'Value') => {
    return data.map(item => ({
      date: new Date(item[dateKey]).toLocaleDateString(),
      value: item[valueKey],
      label: label
    }));
  },

  formatPieChartData: (data, labelKey, valueKey) => {
    return data.map(item => ({
      name: item[labelKey],
      value: item[valueKey]
    }));
  },

  // Color schemes for charts
  getChartColors: () => ({
    primary: '#dc2626',
    secondary: '#059669',
    tertiary: '#2563eb',
    quaternary: '#7c3aed',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  }),

  // Metric definitions and descriptions
  getMetricDefinitions: () => ({
    sent: {
      label: 'Emails Sent',
      description: 'Total number of emails sent',
      format: 'number'
    },
    delivered: {
      label: 'Delivered',
      description: 'Emails successfully delivered to recipient inboxes',
      format: 'number'
    },
    opened: {
      label: 'Opens',
      description: 'Total number of email opens (including multiple opens by same recipient)',
      format: 'number'
    },
    uniqueOpens: {
      label: 'Unique Opens',
      description: 'Number of unique recipients who opened the email',
      format: 'number'
    },
    clicked: {
      label: 'Clicks',
      description: 'Total number of link clicks',
      format: 'number'
    },
    uniqueClicks: {
      label: 'Unique Clicks',
      description: 'Number of unique recipients who clicked a link',
      format: 'number'
    },
    openRate: {
      label: 'Open Rate',
      description: 'Percentage of delivered emails that were opened',
      format: 'percentage'
    },
    clickRate: {
      label: 'Click Rate',
      description: 'Percentage of delivered emails that received clicks',
      format: 'percentage'
    },
    clickToOpenRate: {
      label: 'Click-to-Open Rate',
      description: 'Percentage of opens that resulted in clicks',
      format: 'percentage'
    },
    unsubscribeRate: {
      label: 'Unsubscribe Rate',
      description: 'Percentage of delivered emails that resulted in unsubscribes',
      format: 'percentage'
    },
    bounceRate: {
      label: 'Bounce Rate',
      description: 'Percentage of sent emails that bounced',
      format: 'percentage'
    },
    complaintRate: {
      label: 'Complaint Rate',
      description: 'Percentage of delivered emails marked as spam',
      format: 'percentage'
    },
    deliveryRate: {
      label: 'Delivery Rate',
      description: 'Percentage of sent emails successfully delivered',
      format: 'percentage'
    }
  }),

  // Benchmark data for comparison
  getIndustryBenchmarks: () => ({
    openRate: {
      excellent: 25,
      good: 20,
      average: 15,
      poor: 10
    },
    clickRate: {
      excellent: 5,
      good: 3,
      average: 2,
      poor: 1
    },
    unsubscribeRate: {
      excellent: 0.1,
      good: 0.2,
      average: 0.5,
      poor: 1
    },
    bounceRate: {
      excellent: 2,
      good: 5,
      average: 10,
      poor: 15
    }
  }),

  // Performance rating based on benchmarks
  getPerformanceRating: (metric, value) => {
    const benchmarks = analyticsService.getIndustryBenchmarks();
    const metricBenchmarks = benchmarks[metric];
    
    if (!metricBenchmarks) return 'unknown';
    
    if (value >= metricBenchmarks.excellent) return 'excellent';
    if (value >= metricBenchmarks.good) return 'good';
    if (value >= metricBenchmarks.average) return 'average';
    return 'poor';
  },

  getRatingColor: (rating) => {
    const colors = {
      excellent: 'text-green-600 bg-green-100',
      good: 'text-blue-600 bg-blue-100',
      average: 'text-yellow-600 bg-yellow-100',
      poor: 'text-red-600 bg-red-100',
      unknown: 'text-gray-600 bg-gray-100'
    };
    return colors[rating] || colors.unknown;
  },

  // Get landing page analytics
  getLandingPageAnalytics: async (landingPageId, timeframe = '30d') => {
    try {
      const response = await analyticsAPI.get(`/landing-pages/${landingPageId}`, {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching landing page analytics:', error);
      throw error;
    }
  },

  // Get all landing pages analytics
  getLandingPagesAnalytics: async (timeframe = '30d') => {
    try {
      const response = await analyticsAPI.get('/landing-pages', {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching landing pages analytics:', error);
      throw error;
    }
  },

  // Export data utilities
  exportToCSV: (data, filename = 'analytics-data.csv') => {
    if (!data || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  },

  // Date range utilities
  getDateRangeOptions: () => [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ],

  formatDateRange: (timeframe) => {
    const options = analyticsService.getDateRangeOptions();
    const option = options.find(opt => opt.value === timeframe);
    return option ? option.label : timeframe;
  }
};

export default analyticsService;