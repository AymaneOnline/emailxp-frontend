// emailxp/frontend/src/components/BehavioralTriggerManager.js

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  BarChart,
  Target
} from 'lucide-react';
import { toast } from 'react-toastify';
import behavioralTriggerService from '../services/behavioralTriggerService';
import campaignService from '../services/campaignService';

const BehavioralTriggerManager = () => {
  const [triggers, setTriggers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    campaignTemplate: '',
    triggerEvent: {
      eventType: 'page_view',
      target: '',
      customEventType: ''
    },
    conditions: [],
    timing: {
      delayMinutes: 0,
      timeWindow: {
        start: '',
        end: ''
      },
      activeDays: []
    },
    frequency: {
      maxPerSubscriber: 1,
      periodHours: 24
    },
    isActive: true
  });
  const [stats, setStats] = useState({
    totalTriggers: 0,
    activeTriggers: 0,
    totalFired: 0
  });

  // Event types for the dropdown
  const eventTypes = [
    { value: 'page_view', label: 'Page View' },
    { value: 'product_view', label: 'Product View' },
    { value: 'cart_add', label: 'Add to Cart' },
    { value: 'cart_remove', label: 'Remove from Cart' },
    { value: 'purchase', label: 'Purchase' },
    { value: 'form_submit', label: 'Form Submission' },
    { value: 'link_click', label: 'Link Click' },
    { value: 'video_view', label: 'Video View' },
    { value: 'download', label: 'Download' },
    { value: 'custom', label: 'Custom Event' }
  ];

  // Days of the week
  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  // Load triggers and campaigns on component mount
  useEffect(() => {
    loadTriggers();
    loadCampaigns();
    loadStats();
  }, []);

  const loadTriggers = async () => {
    try {
      setLoading(true);
      const data = await behavioralTriggerService.getAllTriggers();
      setTriggers(data.triggers);
    } catch (error) {
      console.error('Failed to load triggers:', error);
      toast.error('Failed to load triggers');
    } finally {
      setLoading(false);
    }
  };

  const loadCampaigns = async () => {
    try {
      const data = await campaignService.getCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
      toast.error('Failed to load campaigns');
    }
  };

  const loadStats = async () => {
    try {
      const data = await behavioralTriggerService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingTrigger) {
        await behavioralTriggerService.updateTrigger(editingTrigger._id, formData);
        toast.success('Trigger updated successfully');
      } else {
        await behavioralTriggerService.createTrigger(formData);
        toast.success('Trigger created successfully');
      }
      
      // Reset form and reload data
      setShowForm(false);
      setEditingTrigger(null);
      setFormData({
        name: '',
        description: '',
        campaignTemplate: '',
        triggerEvent: {
          eventType: 'page_view',
          target: '',
          customEventType: ''
        },
        conditions: [],
        timing: {
          delayMinutes: 0,
          timeWindow: {
            start: '',
            end: ''
          },
          activeDays: []
        },
        frequency: {
          maxPerSubscriber: 1,
          periodHours: 24
        },
        isActive: true
      });
      
      loadTriggers();
      loadStats();
    } catch (error) {
      console.error('Failed to save trigger:', error);
      toast.error('Failed to save trigger');
    }
  };

  const handleDelete = async (triggerId) => {
    if (window.confirm('Are you sure you want to delete this trigger?')) {
      try {
        await behavioralTriggerService.deleteTrigger(triggerId);
        toast.success('Trigger deleted successfully');
        loadTriggers();
        loadStats();
      } catch (error) {
        console.error('Failed to delete trigger:', error);
        toast.error('Failed to delete trigger');
      }
    }
  };

  const handleToggleActive = async (triggerId, currentStatus) => {
    try {
      await behavioralTriggerService.toggleTrigger(triggerId);
      toast.success(`Trigger ${currentStatus ? 'deactivated' : 'activated'}`);
      loadTriggers();
    } catch (error) {
      console.error('Failed to toggle trigger:', error);
      toast.error('Failed to toggle trigger');
    }
  };

  const handleEdit = (trigger) => {
    setEditingTrigger(trigger);
    setFormData({
      name: trigger.name || '',
      description: trigger.description || '',
      campaignTemplate: trigger.campaignTemplate?._id || trigger.campaignTemplate || '',
      triggerEvent: {
        eventType: trigger.triggerEvent?.eventType || 'page_view',
        target: trigger.triggerEvent?.target || '',
        customEventType: trigger.triggerEvent?.customEventType || ''
      },
      conditions: trigger.conditions || [],
      timing: {
        delayMinutes: trigger.timing?.delayMinutes || 0,
        timeWindow: {
          start: trigger.timing?.timeWindow?.start || '',
          end: trigger.timing?.timeWindow?.end || ''
        },
        activeDays: trigger.timing?.activeDays || []
      },
      frequency: {
        maxPerSubscriber: trigger.frequency?.maxPerSubscriber || 1,
        periodHours: trigger.frequency?.periodHours || 24
      },
      isActive: trigger.isActive !== undefined ? trigger.isActive : true
    });
    setShowForm(true);
  };

  const handleEventTypeChange = (eventType) => {
    setFormData({
      ...formData,
      triggerEvent: {
        ...formData.triggerEvent,
        eventType,
        customEventType: eventType === 'custom' ? formData.triggerEvent.customEventType : ''
      }
    });
  };

  const addCondition = () => {
    setFormData({
      ...formData,
      conditions: [
        ...formData.conditions,
        { field: '', operator: 'equals', value: '' }
      ]
    });
  };

  const updateCondition = (index, field, value) => {
    const newConditions = [...formData.conditions];
    newConditions[index][field] = value;
    setFormData({
      ...formData,
      conditions: newConditions
    });
  };

  const removeCondition = (index) => {
    const newConditions = [...formData.conditions];
    newConditions.splice(index, 1);
    setFormData({
      ...formData,
      conditions: newConditions
    });
  };

  const toggleActiveDay = (day) => {
    const currentDays = formData.timing.activeDays || [];
    let newDays;
    
    if (currentDays.includes(day)) {
      newDays = currentDays.filter(d => d !== day);
    } else {
      newDays = [...currentDays, day];
    }
    
    setFormData({
      ...formData,
      timing: {
        ...formData.timing,
        activeDays: newDays
      }
    });
  };

  if (loading && triggers.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Behavioral Triggers</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Automate email campaigns based on subscriber behavior
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full dark:bg-green-900 dark:text-green-200">
              {stats.activeTriggers} active
            </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-200">
              {stats.totalFired} sent
            </span>
          </div>
          
          <button
            onClick={() => {
              setEditingTrigger(null);
              setFormData({
                name: '',
                description: '',
                campaignTemplate: '',
                triggerEvent: {
                  eventType: 'page_view',
                  target: '',
                  customEventType: ''
                },
                conditions: [],
                timing: {
                  delayMinutes: 0,
                  timeWindow: {
                    start: '',
                    end: ''
                  },
                  activeDays: []
                },
                frequency: {
                  maxPerSubscriber: 1,
                  periodHours: 24
                },
                isActive: true
              });
              setShowForm(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Trigger
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Triggers</h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalTriggers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <Play className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Active Triggers</h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.activeTriggers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <BarChart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Emails Sent</h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalFired}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trigger Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingTrigger ? 'Edit Trigger' : 'Create New Trigger'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Basic Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Trigger Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="e.g., Welcome Series for New Visitors"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Describe what this trigger does"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Trigger Event */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Trigger Event</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Event Type
                      </label>
                      <select
                        value={formData.triggerEvent.eventType}
                        onChange={(e) => handleEventTypeChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        {eventTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    {formData.triggerEvent.eventType === 'custom' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Custom Event Type
                        </label>
                        <input
                          type="text"
                          value={formData.triggerEvent.customEventType}
                          onChange={(e) => setFormData({
                            ...formData,
                            triggerEvent: {
                              ...formData.triggerEvent,
                              customEventType: e.target.value
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="e.g., webinar_registration"
                        />
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Target (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.triggerEvent.target}
                        onChange={(e) => setFormData({
                          ...formData,
                          triggerEvent: {
                            ...formData.triggerEvent,
                            target: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="e.g., /product-page, specific product ID"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Optional filter for specific pages, products, or targets
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Campaign Template */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Campaign Template</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Select Campaign Template
                    </label>
                    <select
                      value={formData.campaignTemplate}
                      onChange={(e) => setFormData({ ...formData, campaignTemplate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select a campaign template</option>
                      {campaigns.map(campaign => (
                        <option key={campaign._id} value={campaign._id}>
                          {campaign.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Timing */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Timing</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Delay (minutes)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.timing.delayMinutes}
                        onChange={(e) => setFormData({
                          ...formData,
                          timing: {
                            ...formData.timing,
                            delayMinutes: parseInt(e.target.value) || 0
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Wait this many minutes before sending the email
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={formData.timing.timeWindow.start}
                          onChange={(e) => setFormData({
                            ...formData,
                            timing: {
                              ...formData.timing,
                              timeWindow: {
                                ...formData.timing.timeWindow,
                                start: e.target.value
                              }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={formData.timing.timeWindow.end}
                          onChange={(e) => setFormData({
                            ...formData,
                            timing: {
                              ...formData.timing,
                              timeWindow: {
                                ...formData.timing.timeWindow,
                                end: e.target.value
                              }
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Active Days
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {daysOfWeek.map(day => (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => toggleActiveDay(day.value)}
                            className={`px-3 py-1 text-sm rounded-full ${
                              (formData.timing.activeDays || []).includes(day.value)
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Frequency */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Frequency</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Max per Subscriber
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.frequency.maxPerSubscriber}
                        onChange={(e) => setFormData({
                          ...formData,
                          frequency: {
                            ...formData.frequency,
                            maxPerSubscriber: parseInt(e.target.value) || 1
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Period (hours)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.frequency.periodHours}
                        onChange={(e) => setFormData({
                          ...formData,
                          frequency: {
                            ...formData.frequency,
                            periodHours: parseInt(e.target.value) || 24
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Conditions */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Conditions</h3>
                    <button
                      type="button"
                      onClick={addCondition}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Condition
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.conditions.map((condition, index) => (
                      <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <input
                          type="text"
                          value={condition.field}
                          onChange={(e) => updateCondition(index, 'field', e.target.value)}
                          placeholder="Field"
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                        />
                        
                        <select
                          value={condition.operator}
                          onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                          className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                        >
                          <option value="equals">Equals</option>
                          <option value="notEquals">Not Equals</option>
                          <option value="contains">Contains</option>
                          <option value="notContains">Not Contains</option>
                          <option value="greaterThan">Greater Than</option>
                          <option value="lessThan">Less Than</option>
                        </select>
                        
                        <input
                          type="text"
                          value={condition.value}
                          onChange={(e) => updateCondition(index, 'value', e.target.value)}
                          placeholder="Value"
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                        />
                        
                        <button
                          type="button"
                          onClick={() => removeCondition(index)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    
                    {formData.conditions.length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No conditions added. Add conditions to target specific subscriber segments.
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Active
                  </label>
                </div>
                
                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    {editingTrigger ? 'Update Trigger' : 'Create Trigger'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Triggers List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Active Triggers</h2>
        </div>
        
        {triggers.length === 0 ? (
          <div className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No triggers yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating a new behavioral trigger.
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setEditingTrigger(null);
                  setFormData({
                    name: '',
                    description: '',
                    campaignTemplate: '',
                    triggerEvent: {
                      eventType: 'page_view',
                      target: '',
                      customEventType: ''
                    },
                    conditions: [],
                    timing: {
                      delayMinutes: 0,
                      timeWindow: {
                        start: '',
                        end: ''
                      },
                      activeDays: []
                    },
                    frequency: {
                      maxPerSubscriber: 1,
                      periodHours: 24
                    },
                    isActive: true
                  });
                  setShowForm(true);
                }}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Trigger
              </button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {triggers.map((trigger) => (
              <li key={trigger._id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {trigger.name}
                      </h3>
                      {!trigger.isActive && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {trigger.description || 'No description'}
                    </p>
                    <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Target className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      <span>
                        {eventTypes.find(e => e.value === trigger.triggerEvent?.eventType)?.label || trigger.triggerEvent?.eventType}
                        {trigger.triggerEvent?.target && `: ${trigger.triggerEvent.target}`}
                      </span>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleActive(trigger._id, trigger.isActive)}
                      className={`p-2 rounded-full ${
                        trigger.isActive 
                          ? 'text-green-600 hover:text-green-800 bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30' 
                          : 'text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
                      }`}
                    >
                      {trigger.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    
                    <button
                      onClick={() => handleEdit(trigger)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(trigger._id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {trigger.campaignTemplate && (
                  <div className="mt-3 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {trigger.campaignTemplate.name || 'Campaign Template'}
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BehavioralTriggerManager;