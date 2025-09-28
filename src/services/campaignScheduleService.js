// emailxp/frontend/src/services/campaignScheduleService.js

import axios from 'axios';
import devLog from '../utils/devLog';

import { getBackendUrl } from '../utils/getBackendUrl';

const base = (getBackendUrl() || '').replace(/\/$/, '');
const SCHEDULE_API = base ? `${base}/api/campaign-schedules` : '/api/campaign-schedules';
// Create axios instance with default config and auth
const scheduleAPI = axios.create({ baseURL: SCHEDULE_API });

scheduleAPI.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = user && user.token ? user.token : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const campaignScheduleService = {
  // Get all campaign schedules
  getSchedules: async (params = {}) => {
    try {
      const response = await scheduleAPI.get('/', { params });
      return response.data;
    } catch (error) {
      devLog('Error fetching campaign schedules:', error);
      throw error;
    }
  },

  // Get specific campaign schedule
  getSchedule: async (id) => {
    try {
      const response = await scheduleAPI.get(`/${id}`);
      return response.data;
    } catch (error) {
      devLog('Error fetching campaign schedule:', error);
      throw error;
    }
  },

  // Create new campaign schedule
  createSchedule: async (scheduleData) => {
    try {
      const response = await scheduleAPI.post('/', scheduleData);
      return response.data;
    } catch (error) {
      devLog('Error creating campaign schedule:', error);
      throw error;
    }
  },

  // Update campaign schedule
  updateSchedule: async (id, scheduleData) => {
    try {
      const response = await scheduleAPI.put(`/${id}`, scheduleData);
      return response.data;
    } catch (error) {
      devLog('Error updating campaign schedule:', error);
      throw error;
    }
  },

  // Start/Resume campaign schedule
  startSchedule: async (id) => {
    try {
      const response = await scheduleAPI.post(`/${id}/start`);
      return response.data;
    } catch (error) {
      devLog('Error starting campaign schedule:', error);
      throw error;
    }
  },

  // Pause campaign schedule
  pauseSchedule: async (id) => {
    try {
      const response = await scheduleAPI.post(`/${id}/pause`);
      return response.data;
    } catch (error) {
      devLog('Error pausing campaign schedule:', error);
      throw error;
    }
  },

  // Cancel campaign schedule
  cancelSchedule: async (id) => {
    try {
      const response = await scheduleAPI.post(`/${id}/cancel`);
      return response.data;
    } catch (error) {
      devLog('Error cancelling campaign schedule:', error);
      throw error;
    }
  },

  // Delete campaign schedule
  deleteSchedule: async (id) => {
    try {
      const response = await scheduleAPI.delete(`/${id}`);
      return response.data;
    } catch (error) {
      devLog('Error deleting campaign schedule:', error);
      throw error;
    }
  },

  // Get execution history
  getExecutionHistory: async (id, params = {}) => {
    try {
      const response = await scheduleAPI.get(`/${id}/executions`, { params });
      return response.data;
    } catch (error) {
      devLog('Error fetching execution history:', error);
      throw error;
    }
  },

  // Manual execution
  executeSchedule: async (id) => {
    try {
      const response = await scheduleAPI.post(`/${id}/execute`);
      return response.data;
    } catch (error) {
      devLog('Error executing campaign schedule:', error);
      throw error;
    }
  },

  // Helper methods for schedule configuration
  validateScheduleConfig: (scheduleType, config) => {
    const errors = [];

    switch (scheduleType) {
      case 'scheduled':
        if (!config.scheduledDate) {
          errors.push('Scheduled date is required');
        } else if (new Date(config.scheduledDate) <= new Date()) {
          errors.push('Scheduled date must be in the future');
        }
        break;

      case 'recurring':
        if (!config.recurrence || !config.recurrence.type) {
          errors.push('Recurrence type is required');
        }
        if (config.recurrence && config.recurrence.interval < 1) {
          errors.push('Recurrence interval must be at least 1');
        }
        break;

      case 'drip':
        if (!config.dripSequence || config.dripSequence.length === 0) {
          errors.push('At least one drip sequence step is required');
        }
        config.dripSequence?.forEach((step, index) => {
          if (!step.template) {
            errors.push(`Template is required for drip step ${index + 1}`);
          }
          if (!step.delay || step.delay < 0) {
            errors.push(`Valid delay is required for drip step ${index + 1}`);
          }
        });
        break;

      case 'trigger':
        if (!config.triggers || config.triggers.length === 0) {
          errors.push('At least one trigger is required');
        }
        config.triggers?.forEach((trigger, index) => {
          if (!trigger.event) {
            errors.push(`Event is required for trigger ${index + 1}`);
          }
        });
        break;
    }

    return errors;
  },

  // Get schedule type options
  getScheduleTypes: () => [
    {
      value: 'immediate',
      label: 'Send Immediately',
      description: 'Send the campaign right away'
    },
    {
      value: 'scheduled',
      label: 'Schedule for Later',
      description: 'Send the campaign at a specific date and time'
    },
    {
      value: 'recurring',
      label: 'Recurring Campaign',
      description: 'Send the campaign on a recurring schedule'
    },
    {
      value: 'drip',
      label: 'Drip Campaign',
      description: 'Send a series of emails over time'
    },
    {
      value: 'trigger',
      label: 'Trigger-based',
      description: 'Send based on subscriber actions or events'
    }
  ],

  // Get recurrence options
  getRecurrenceTypes: () => [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ],

  // Get trigger event options
  getTriggerEvents: () => [
    {
      value: 'subscriber_added',
      label: 'Subscriber Added',
      description: 'When a new subscriber is added'
    },
    {
      value: 'tag_added',
      label: 'Tag Added',
      description: 'When a tag is added to a subscriber'
    },
    {
      value: 'tag_removed',
      label: 'Tag Removed',
      description: 'When a tag is removed from a subscriber'
    },
    {
      value: 'date_reached',
      label: 'Date Reached',
      description: 'When a specific date is reached'
    },
    {
      value: 'custom_event',
      label: 'Custom Event',
      description: 'When a custom event occurs'
    }
  ],

  // Get condition operators
  getConditionOperators: () => [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does Not Contain' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'exists', label: 'Exists' },
    { value: 'not_exists', label: 'Does Not Exist' }
  ],

  // Get delay units
  getDelayUnits: () => [
    { value: 'minutes', label: 'Minutes' },
    { value: 'hours', label: 'Hours' },
    { value: 'days', label: 'Days' },
    { value: 'weeks', label: 'Weeks' }
  ],

  // Format schedule display
  formatScheduleDisplay: (schedule) => {
    switch (schedule.scheduleType) {
      case 'immediate':
        return 'Send immediately';
      case 'scheduled':
        return `Send on ${new Date(schedule.scheduledDate).toLocaleString()}`;
      case 'recurring':
        const recurrence = schedule.recurrence;
        return `Send ${recurrence.type} (every ${recurrence.interval} ${recurrence.type})`;
      case 'drip':
        return `Drip campaign (${schedule.dripSequence?.length || 0} steps)`;
      case 'trigger':
        return `Trigger-based (${schedule.triggers?.length || 0} triggers)`;
      default:
        return 'Unknown schedule type';
    }
  },

  // Get status color
  getStatusColor: (status) => {
    const colors = {
      draft: 'gray',
      scheduled: 'blue',
      running: 'green',
      paused: 'yellow',
      completed: 'purple',
      cancelled: 'red'
    };
    return colors[status] || 'gray';
  },

  // Get status icon
  getStatusIcon: (status) => {
    const icons = {
      draft: 'FileText',
      scheduled: 'Clock',
      running: 'Play',
      paused: 'Pause',
      completed: 'CheckCircle',
      cancelled: 'XCircle'
    };
    return icons[status] || 'FileText';
  }
};

export default campaignScheduleService;