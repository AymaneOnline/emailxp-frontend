// emailxp/frontend/src/components/EnhancedCampaignList.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Send, 
  Calendar, 
  Users, 
  Mail, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Copy,
  BarChart3
} from 'lucide-react';
import { toast } from 'react-toastify';
import campaignService from '../services/campaignService';

const STATUS_CONFIG = {
  draft: { 
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300', 
    icon: Edit,
    label: 'Draft'
  },
  scheduled: { 
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', 
    icon: Clock,
    label: 'Scheduled'
  },
  sending: { 
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', 
    icon: Send,
    label: 'Sending'
  },
  sent: { 
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', 
    icon: CheckCircle,
    label: 'Sent'
  },
  cancelled: { 
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300', 
    icon: XCircle,
    label: 'Cancelled'
  },
  failed: { 
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', 
    icon: XCircle,
    label: 'Failed'
  }
};

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Campaigns' },
  { value: 'draft', label: 'Drafts' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'sending', label: 'Sending' },
  { value: 'sent', label: 'Sent' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'failed', label: 'Failed' }
];

const EnhancedCampaignList = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  // Load campaigns
  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await campaignService.getCampaigns();
      setCampaigns(data || []);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    const statusMatch = statusFilter === 'all' || campaign.status === statusFilter;
    const searchMatch = searchTerm === '' || 
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && searchMatch;
  });

  // Handle campaign actions
  const handleAction = async (campaignId, action) => {
    setActionMenuOpen(null);
    
    try {
      switch (action) {
        case 'view':
          navigate(`/campaigns/details/${campaignId}`);
          break;
          
        case 'edit':
          navigate(`/campaigns/edit/${campaignId}`);
          break;
          
        case 'duplicate':
          const campaign = campaigns.find(c => c._id === campaignId);
          if (campaign) {
            const duplicatedCampaign = await campaignService.createCampaign({
              ...campaign,
              name: `${campaign.name} (Copy)`,
              status: 'draft'
            });
            toast.success('Campaign duplicated successfully');
            loadCampaigns();
          }
          break;
          
        case 'send':
          if (window.confirm('Are you sure you want to send this campaign now?')) {
            await campaignService.sendCampaign(campaignId);
            toast.success('Campaign sent successfully');
            loadCampaigns();
          }
          break;
          
        case 'delete':
          if (window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
            await campaignService.deleteCampaign(campaignId);
            toast.success('Campaign deleted successfully');
            loadCampaigns();
          }
          break;
          
        default:
          break;
      }
    } catch (error) {
      console.error(`Failed to ${action} campaign:`, error);
      toast.error(`Failed to ${action} campaign`);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action) => {
    if (selectedCampaigns.length === 0) return;
    
    try {
      switch (action) {
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${selectedCampaigns.length} campaign(s)?`)) {
            await Promise.all(selectedCampaigns.map(id => campaignService.deleteCampaign(id)));
            toast.success(`${selectedCampaigns.length} campaign(s) deleted successfully`);
            setSelectedCampaigns([]);
            loadCampaigns();
          }
          break;
          
        default:
          break;
      }
    } catch (error) {
      console.error(`Failed to ${action} campaigns:`, error);
      toast.error(`Failed to ${action} campaigns`);
    }
  };

  // Handle campaign selection
  const handleCampaignSelect = (campaignId, checked) => {
    if (checked) {
      setSelectedCampaigns(prev => [...prev, campaignId]);
    } else {
      setSelectedCampaigns(prev => prev.filter(id => id !== campaignId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedCampaigns(filteredCampaigns.map(c => c._id));
    } else {
      setSelectedCampaigns([]);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate open rate
  const calculateOpenRate = (campaign) => {
    if (!campaign.totalRecipients || campaign.totalRecipients === 0) return 0;
    return Math.round((campaign.opens / campaign.totalRecipients) * 100);
  };

  // Calculate click rate
  const calculateClickRate = (campaign) => {
    if (!campaign.totalRecipients || campaign.totalRecipients === 0) return 0;
    return Math.round((campaign.clicks / campaign.totalRecipients) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campaigns</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create, manage, and track your email campaigns
          </p>
        </div>
        
        <button
          onClick={() => navigate('/campaigns/new')}
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Campaign
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {FILTER_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCampaigns.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {selectedCampaigns.length} campaign(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('delete')}
                className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </button>
              <button
                onClick={() => setSelectedCampaigns([])}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaigns List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No campaigns found' : 'No campaigns yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first email campaign to get started'
              }
            </p>
            {(!searchTerm && statusFilter === 'all') && (
              <button
                onClick={() => navigate('/campaigns/new')}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Campaign
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedCampaigns.length === filteredCampaigns.length && filteredCampaigns.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Recipients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCampaigns.map((campaign) => {
                  const statusConfig = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.draft;
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <tr key={campaign._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedCampaigns.includes(campaign._id)}
                          onChange={(e) => handleCampaignSelect(campaign._id, e.target.checked)}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {campaign.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {campaign.subject}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <Users className="w-4 h-4 mr-1 text-gray-400" />
                          {campaign.totalRecipients || 0}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        {campaign.status === 'sent' && campaign.totalRecipients > 0 ? (
                          <div className="flex items-center space-x-4">
                            <div className="text-sm">
                              <div className="text-gray-900 dark:text-white font-medium">
                                {calculateOpenRate(campaign)}% opens
                              </div>
                              <div className="text-gray-500 dark:text-gray-400">
                                {calculateClickRate(campaign)}% clicks
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                        )}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {campaign.status === 'scheduled' ? (
                            <div>
                              <div className="font-medium">Scheduled</div>
                              <div className="text-gray-500 dark:text-gray-400">
                                {formatDate(campaign.scheduledAt)}
                              </div>
                            </div>
                          ) : campaign.status === 'sent' ? (
                            <div>
                              <div className="font-medium">Sent</div>
                              <div className="text-gray-500 dark:text-gray-400">
                                {formatDate(campaign.sentAt)}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="font-medium">Created</div>
                              <div className="text-gray-500 dark:text-gray-400">
                                {formatDate(campaign.createdAt)}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 text-right">
                        <div className="relative">
                          <button
                            onClick={() => setActionMenuOpen(actionMenuOpen === campaign._id ? null : campaign._id)}
                            className="inline-flex items-center p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          
                          {actionMenuOpen === campaign._id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => handleAction(campaign._id, 'view')}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </button>
                                
                                {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
                                  <button
                                    onClick={() => handleAction(campaign._id, 'edit')}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </button>
                                )}
                                
                                <button
                                  onClick={() => handleAction(campaign._id, 'duplicate')}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <Copy className="w-4 h-4 mr-2" />
                                  Duplicate
                                </button>
                                
                                {campaign.status === 'draft' && (
                                  <button
                                    onClick={() => handleAction(campaign._id, 'send')}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                  >
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Now
                                  </button>
                                )}
                                
                                <div className="border-t border-gray-200 dark:border-gray-600 my-1"></div>
                                
                                <button
                                  onClick={() => handleAction(campaign._id, 'delete')}
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedCampaignList;