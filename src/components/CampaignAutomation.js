// emailxp/frontend/src/components/CampaignAutomation.js

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Play,
  Pause,
  Square,
  Edit,
  Trash2,
  Clock,
  Repeat,
  Zap,
  Mail,
  Users,
  TrendingUp,
  Calendar,
  Settings,
  Eye,
  MoreVertical
} from 'lucide-react';
import { toast } from 'react-toastify';
import campaignScheduleService from '../services/campaignScheduleService';

const CampaignAutomation = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadSchedules();
  }, [selectedStatus, selectedType]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }
      
      if (selectedType !== 'all') {
        params.scheduleType = selectedType;
      }

      const response = await campaignScheduleService.getSchedules(params);
      setSchedules(response.schedules || []);
    } catch (error) {
      console.error('Error loading schedules:', error);
      toast.error('Failed to load campaign schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSchedule = async (scheduleId) => {
    try {
      await campaignScheduleService.startSchedule(scheduleId);
      toast.success('Campaign schedule started successfully');
      loadSchedules();
    } catch (error) {
      console.error('Error starting schedule:', error);
      toast.error('Failed to start campaign schedule');
    }
  };

  const handlePauseSchedule = async (scheduleId) => {
    try {
      await campaignScheduleService.pauseSchedule(scheduleId);
      toast.success('Campaign schedule paused successfully');
      loadSchedules();
    } catch (error) {
      console.error('Error pausing schedule:', error);
      toast.error('Failed to pause campaign schedule');
    }
  };

  const handleCancelSchedule = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to cancel this campaign schedule?')) {
      return;
    }

    try {
      await campaignScheduleService.cancelSchedule(scheduleId);
      toast.success('Campaign schedule cancelled successfully');
      loadSchedules();
    } catch (error) {
      console.error('Error cancelling schedule:', error);
      toast.error('Failed to cancel campaign schedule');
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to delete this campaign schedule?')) {
      return;
    }

    try {
      await campaignScheduleService.deleteSchedule(scheduleId);
      toast.success('Campaign schedule deleted successfully');
      loadSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast.error('Failed to delete campaign schedule');
    }
  };

  const getScheduleTypeIcon = (type) => {
    const icons = {
      immediate: Mail,
      scheduled: Clock,
      recurring: Repeat,
      drip: TrendingUp,
      trigger: Zap
    };
    const IconComponent = icons[type] || Mail;
    return <IconComponent className="h-4 w-4" />;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      scheduled: { color: 'bg-blue-100 text-blue-800', label: 'Scheduled' },
      running: { color: 'bg-green-100 text-green-800', label: 'Running' },
      paused: { color: 'bg-yellow-100 text-yellow-800', label: 'Paused' },
      completed: { color: 'bg-purple-100 text-purple-800', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.draft;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const renderScheduleActions = (schedule) => {
    const actions = [];

    if (schedule.status === 'draft' || schedule.status === 'paused') {
      actions.push(
        <button
          key="start"
          onClick={() => handleStartSchedule(schedule._id)}
          className="p-1 text-green-600 hover:text-green-800"
          title="Start"
        >
          <Play className="h-4 w-4" />
        </button>
      );
    }

    if (schedule.status === 'running' || schedule.status === 'scheduled') {
      actions.push(
        <button
          key="pause"
          onClick={() => handlePauseSchedule(schedule._id)}
          className="p-1 text-yellow-600 hover:text-yellow-800"
          title="Pause"
        >
          <Pause className="h-4 w-4" />
        </button>
      );
    }

    if (schedule.status !== 'completed' && schedule.status !== 'cancelled') {
      actions.push(
        <button
          key="cancel"
          onClick={() => handleCancelSchedule(schedule._id)}
          className="p-1 text-red-600 hover:text-red-800"
          title="Cancel"
        >
          <Square className="h-4 w-4" />
        </button>
      );
    }

    if (schedule.status !== 'running') {
      actions.push(
        <button
          key="delete"
          onClick={() => handleDeleteSchedule(schedule._id)}
          className="p-1 text-red-600 hover:text-red-800"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      );
    }

    return actions;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-red"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campaign Automation</h2>
          <p className="text-gray-600">Manage automated email campaigns and schedules</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Create Schedule</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-red focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="running">Running</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Type:</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-red focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="immediate">Immediate</option>
            <option value="scheduled">Scheduled</option>
            <option value="recurring">Recurring</option>
            <option value="drip">Drip Campaign</option>
            <option value="trigger">Trigger-based</option>
          </select>
        </div>
      </div>

      {/* Schedules List */}
      {schedules.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Campaign Schedules</h3>
          <p className="text-gray-600 mb-4">
            Create your first automated campaign schedule to get started
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-red text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Schedule</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Next Execution
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedules.map((schedule) => (
                  <tr key={schedule._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {schedule.name}
                        </div>
                        {schedule.description && (
                          <div className="text-sm text-gray-500">
                            {schedule.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {schedule.campaign?.name || 'Unknown Campaign'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {schedule.campaign?.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getScheduleTypeIcon(schedule.scheduleType)}
                        <span className="text-sm text-gray-900 capitalize">
                          {schedule.scheduleType}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {campaignScheduleService.formatScheduleDisplay(schedule)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(schedule.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="space-y-1">
                        <div>Sent: {schedule.stats?.totalSent || 0}</div>
                        <div>Opened: {schedule.stats?.totalOpened || 0}</div>
                        <div>Clicked: {schedule.stats?.totalClicked || 0}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {schedule.stats?.nextExecution ? (
                        new Date(schedule.stats.nextExecution).toLocaleString()
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-1">
                        {renderScheduleActions(schedule)}
                        <button
                          className="p-1 text-gray-600 hover:text-gray-800"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignAutomation;