// emailxp/frontend/src/components/CampaignList.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Trash2, 
  Users, 
  AlertTriangle
} from 'lucide-react';
import { StatusBadge } from './ui/StatusBadge';
import { Skeleton } from './ui/Skeleton';
import { EmptyState } from './ui/EmptyState';
import { PageHeader } from './ui/PageHeader';
import { Button } from './ui/Button';
import { toast } from 'react-toastify';
import campaignService from '../services/campaignService';
// Campaign creation uses separate route `/campaigns/new`

// Status styling now handled by StatusBadge component

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Campaigns' },
  { value: 'draft', label: 'Drafts' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'sending', label: 'Sending' },
  { value: 'sent', label: 'Sent' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'failed', label: 'Failed' }
];

const CampaignList = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, campaign: null });
  const [bulkDeleteModal, setBulkDeleteModal] = useState({ isOpen: false, count: 0 });
  // create modal removed — now navigates to dedicated page
  // Removed action menu state - no longer needed

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

  // Handle delete campaign
  const handleDeleteCampaign = (campaign) => {
    setDeleteModal({ isOpen: true, campaign });
  };

  const confirmDeleteCampaign = async () => {
    if (!deleteModal.campaign) return;
    
    try {
      await campaignService.deleteCampaign(deleteModal.campaign._id);
      toast.success('Campaign deleted successfully');
      loadCampaigns();
    } catch (error) {
      console.error('Failed to delete campaign:', error);
      toast.error('Failed to delete campaign');
    } finally {
      setDeleteModal({ isOpen: false, campaign: null });
    }
  };

  const cancelDeleteCampaign = () => {
    setDeleteModal({ isOpen: false, campaign: null });
  };

  // Handle view campaign details
  const handleViewCampaignDetails = (campaignId) => {
    navigate(`/campaigns/details/${campaignId}`);
  };

  // Handle bulk actions
  const handleBulkAction = async (action) => {
    if (selectedCampaigns.length === 0) return;
    
    if (action === 'delete') {
      setBulkDeleteModal({ isOpen: true, count: selectedCampaigns.length });
    }
  };

  const confirmBulkDelete = async () => {
    try {
      await Promise.all(selectedCampaigns.map(id => campaignService.deleteCampaign(id)));
      toast.success(`${selectedCampaigns.length} campaign(s) deleted successfully`);
      setSelectedCampaigns([]);
      loadCampaigns();
    } catch (error) {
      console.error('Failed to delete campaigns:', error);
      toast.error('Failed to delete campaigns');
    } finally {
      setBulkDeleteModal({ isOpen: false, count: 0 });
    }
  };

  const cancelBulkDelete = () => {
    setBulkDeleteModal({ isOpen: false, count: 0 });
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
      <div className="space-y-6">
        <PageHeader
          title="Campaigns"
          description="Create, manage, and track your email campaigns"
          actions={
            <Button onClick={() => navigate('/campaigns/new')}>
              <Plus className="w-4 h-4 mr-2" /> New Campaign
            </Button>
          }
        />
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campaigns"
        description="Create, manage, and track your email campaigns"
          actions={
            <Button onClick={() => navigate('/campaigns/new')}>
              <Plus className="w-4 h-4 mr-2" /> New Campaign
            </Button>
          }
      />

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
          <EmptyState
            title={searchTerm || statusFilter !== 'all' ? 'No matching campaigns' : 'No campaigns yet'}
            description={
              searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or status filter.'
                : 'Start by creating your first campaign to reach your audience.'
            }
          />
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
                            <button 
                              onClick={() => handleViewCampaignDetails(campaign._id)}
                              className="text-red-600 hover:text-red-800 font-medium cursor-pointer transition-colors duration-200"
                            >
                              {campaign.name}
                            </button>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {campaign.subject}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <StatusBadge status={campaign.status} />
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
                        <button
                          onClick={() => handleDeleteCampaign(campaign)}
                          className="inline-flex items-center p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                          aria-label={`Delete campaign ${campaign.name}`}
                          title="Delete campaign"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={cancelDeleteCampaign}
            ></div>

            {/* Modal panel */}
            <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-red-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                    Delete Campaign
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Are you sure you want to delete the campaign{' '}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        "{deleteModal.campaign?.name}"
                      </span>
                      ? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmDeleteCampaign}
                  className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={cancelDeleteCampaign}
                  className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Campaign creation uses dedicated route `/campaigns/new`; modal removed */}

      {/* Bulk Delete Confirmation Modal */}
      {bulkDeleteModal.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={cancelBulkDelete}
            ></div>

            {/* Modal panel */}
            <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-red-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                    Delete Multiple Campaigns
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Are you sure you want to delete{' '}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {bulkDeleteModal.count} campaign(s)
                      </span>
                      ? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmBulkDelete}
                  className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete All
                </button>
                <button
                  type="button"
                  onClick={cancelBulkDelete}
                  className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignList;