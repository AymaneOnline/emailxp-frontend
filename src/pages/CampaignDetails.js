// emailxp/frontend/src/pages/CampaignDetails.js

import React, { useState, useEffect, Fragment, useCallback } from 'react';
import { H1, H3, H4, Body, Small } from '../components/ui/Typography';
import { useParams, useNavigate } from 'react-router-dom';
import campaignService from '../services/campaignService';
import axios from 'axios';
import { toast } from 'react-toastify';
import CampaignTimeSeriesChart from '../components/CampaignTimeSeriesChart';

import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  EnvelopeIcon,
  EyeIcon,
  CursorArrowRaysIcon,
  CalendarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, EllipsisVerticalIcon } from '@heroicons/react/20/solid';
import DomainDependentButton from '../components/DomainDependentButton';
import { handleDomainError } from '../utils/domainErrors';



function getStatusConfig(status) {
  switch ((status || '').toLowerCase()) {
    case 'draft':
      return {
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-700',
        icon: 'draft',
        label: 'Draft'
      };
    case 'scheduled':
      return {
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-700',
        icon: 'scheduled',
        label: 'Scheduled'
      };
    case 'sending':
      return {
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-700',
        icon: 'sending',
        label: 'Sending'
      };
    case 'sent':
      return {
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        icon: 'sent',
        label: 'Sent'
      };
    case 'cancelled':
      return {
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-600',
        icon: 'cancelled',
        label: 'Cancelled'
      };
    case 'failed':
      return {
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        icon: 'failed',
        label: 'Failed'
      };
    default:
      return {
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-700',
        icon: 'unknown',
        label: status || 'Unknown'
      };
  }
}

function CampaignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [timeSeriesData, setTimeSeriesData] = useState(null);
  const [timeSeriesTimeframe, setTimeSeriesTimeframe] = useState('7days');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [testEmailRecipient, setTestEmailRecipient] = useState('');
  const [showTestEmailModal, setShowTestEmailModal] = useState(false);
  const [isSendingCampaign, setIsSendingCampaign] = useState(false);
  const [showSendCampaignModal, setShowSendCampaignModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState('');

  const fetchCampaignDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await campaignService.getCampaignById(id);
      setCampaign(data);
    } catch (err) {
      console.error("Failed to fetch campaign details:", err);
      setError(err.response?.data?.message || "Failed to load campaign details.");
    } finally {
      setLoading(false);
    }
  }, [id]); // Removed navigate from dependencies, as it's not used inside useCallback

  const fetchAnalyticsData = useCallback(async () => {
    try {
      const analytics = await campaignService.getCampaignAnalytics(id);
      setAnalyticsData(analytics);
    } catch (err) {
      console.error("Failed to fetch campaign analytics:", err);
      toast.error(err.response?.data?.message || "Failed to load campaign analytics.");
    }
  }, [id]);

  const fetchTimeSeriesData = useCallback(async (timeframe) => {
    try {
      const timeSeries = await campaignService.getCampaignAnalyticsTimeSeries(id, timeframe);
      setTimeSeriesData(timeSeries);
    } catch (err) {
      console.error("Failed to fetch time series analytics:", err);
      toast.error(err.response?.data?.message || "Failed to load time series analytics.");
    }
  }, [id]);

  useEffect(() => {
    fetchCampaignDetails();
    fetchAnalyticsData();
  }, [fetchCampaignDetails, fetchAnalyticsData]);

  useEffect(() => {
    fetchTimeSeriesData(timeSeriesTimeframe);
  }, [fetchTimeSeriesData, timeSeriesTimeframe]);

  // Polling for near real-time analytics updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCampaignDetails();
      fetchAnalyticsData();
      fetchTimeSeriesData(timeSeriesTimeframe);
    }, 30000); // 30s
    return () => clearInterval(interval);
  }, [fetchCampaignDetails, fetchAnalyticsData, fetchTimeSeriesData, timeSeriesTimeframe]);

  const handleSendTestEmail = async () => {
    // Domain gating safeguard (UI already disables)
    // Proceed only if domain verified; if not, early return
    if (!testEmailRecipient) {
      toast.error("Please enter a recipient email for the test.");
      return;
    }
    setIsSendingTestEmail(true);
    try {
      await campaignService.sendTestEmail(id, testEmailRecipient);
      toast.success("Test email sent successfully!");
      setShowTestEmailModal(false);
      setTestEmailRecipient('');
    } catch (err) {
      console.error("Error sending test email:", err);
      if (handleDomainError(err, navigate)) return; 
      toast.error(err.response?.data?.message || "Failed to send test email.");
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  const handleSendCampaign = async () => {
    setIsSendingCampaign(true);
    try {
      await campaignService.sendCampaign(id);
      toast.success("Campaign sent successfully!");
      setShowSendCampaignModal(false);
      // Optionally, navigate away or update campaign status
      fetchCampaignDetails(); // Refresh campaign details to reflect sent status
    } catch (err) {
      console.error("Error sending campaign:", err);
      if (handleDomainError(err, navigate)) return; 
      toast.error(err.response?.data?.message || "Failed to send campaign.");
    } finally {
      setIsSendingCampaign(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
          <div className="flex flex-col items-center space-y-4">
            <ArrowPathIcon className="h-12 w-12 text-blue-600 animate-spin" />
            <div className="text-center">
              <H3 className="mb-0">Loading Campaign</H3>
              <p className="text-gray-500 mt-1">Fetching campaign details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-200 max-w-md w-full">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="p-3 bg-red-100 rounded-full">
              <XCircleIcon className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <H3 className="mb-2">Something went wrong</H3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => navigate('/campaigns')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Campaigns
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 max-w-md w-full">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="p-3 bg-gray-100 rounded-full">
              <EnvelopeIcon className="w-8 h-8 text-gray-600" />
            </div>
            <div>
              <H3 className="mb-2">Campaign not found</H3>
              <p className="text-gray-600 mb-6">The campaign you're looking for doesn't exist or has been removed.</p>
              <button
                onClick={() => navigate('/campaigns')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Campaigns
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(campaign.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            {/* Breadcrumb */}
            <div className="flex items-center space-x-2 mb-4">
              <button
                onClick={() => navigate('/campaigns')}
                className="hover:text-gray-700 transition-colors duration-200"
              >
                Campaigns
              </button>
              <span>/</span>
              <span className="text-gray-900 font-medium">{campaign.name}</span>
            </div>

            {/* Title and Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <H1 className="truncate text-2xl lg:text-3xl font-bold !text-gray-900">{campaign.name}</H1>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                    {statusConfig.label}
                  </span>
                </div>
                <Body className="mt-1 text-gray-600">{campaign.subject}</Body>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 lg:mt-0 flex flex-wrap items-center gap-3">
                <DomainDependentButton
                  onClick={() => setShowTestEmailModal(true)}
                  reason="send a test email"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  <EnvelopeIcon className="w-4 h-4 mr-2" />
                  Send Test
                </DomainDependentButton>
                
                <button
                  onClick={() => navigate(`/campaigns/edit/${campaign._id}`)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  <Cog6ToothIcon className="w-4 h-4 mr-2" />
                  Edit
                </button>

                <DomainDependentButton
                  onClick={() => setShowSendCampaignModal(true)}
                  reason="send this campaign"
                  disabled={['sent','cancelled','failed','sending'].includes((campaign.status||'').toLowerCase())}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    ['sent','cancelled','failed','sending'].includes((campaign.status||'').toLowerCase())
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                  }`}
                >
                  <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                  Send Campaign
                </DomainDependentButton>

                {/* More Actions Menu */}
                {campaign.status === 'scheduled' && campaign.scheduledAt && new Date(campaign.scheduledAt) > new Date() && (
                  <Menu as="div" className="relative">
                    <Menu.Button className="inline-flex items-center p-2 border border-gray-300 rounded-lg text-gray-400 bg-white hover:text-gray-500 hover:bg-gray-50">
                      <EllipsisVerticalIcon className="w-5 h-5" />
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => setShowRescheduleModal(true)}
                              className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700 w-full text-left`}
                            >
                              Reschedule
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={async () => {
                                try {
                                  await axios.post(`/api/campaigns/${campaign._id}/cancel`);
                                  toast.success('Campaign cancelled');
                                  fetchCampaignDetails();
                                } catch (e) {
                                  toast.error(e.response?.data?.message || 'Failed to cancel campaign');
                                }
                              }}
                              className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-red-700 w-full text-left`}
                            >
                              Cancel Campaign
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Campaign Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <H3 className="mb-4">Campaign Information</H3>
              <div className="space-y-4">
                <div>
                  <Small className="font-medium text-gray-500">Subject Line</Small>
                  <Body className="text-gray-900 mt-1">{campaign.subject}</Body>
                </div>
                
                <div>
                  <Small className="font-medium text-gray-500">Groups</Small>
                  <Body className="text-gray-900 mt-1">
                    {Array.isArray(campaign.groups) && campaign.groups.length > 0 
                      ? campaign.groups.map(g => g.name || g).join(', ') 
                      : (campaign.group?.name || 'N/A')
                    }
                  </Body>
                </div>

                <div>
                  <Small className="font-medium text-gray-500">Status</Small>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                </div>

                <div>
                  <Small className="font-medium text-gray-500">Created</Small>
                  <Body className="text-gray-900 mt-1">{new Date(campaign.createdAt).toLocaleDateString()}</Body>
                </div>

                <div>
                  <Small className="font-medium text-gray-500">Last Updated</Small>
                  <Body className="text-gray-900 mt-1">{new Date(campaign.updatedAt).toLocaleDateString()}</Body>
                </div>

                {typeof campaign.totalRecipients === 'number' && (
                  <div>
                    <Small className="font-medium text-gray-500">Total Recipients</Small>
                    <Body className="text-gray-900 mt-1 font-semibold">{campaign.totalRecipients.toLocaleString()}</Body>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Analytics Cards */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {/* Sent Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <PaperAirplaneIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {(analyticsData?.emailsSuccessfullySent ?? analyticsData?.emailsSent ?? 0).toLocaleString()}
                  </p>
                  <Small className="text-gray-500">Emails Sent</Small>
                </div>
              </div>

              {/* Opens Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <EyeIcon className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {(analyticsData?.opensCount ?? analyticsData?.opens ?? 0).toLocaleString()}
                  </p>
                  <Small className="text-gray-500">
                    Opens ({analyticsData?.openRate ? Number(analyticsData.openRate).toFixed(1) : '0.0'}%)
                  </Small>
                </div>
              </div>

              {/* Clicks Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <CursorArrowRaysIcon className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {(analyticsData?.clicksCount ?? analyticsData?.clicks ?? 0).toLocaleString()}
                  </p>
                  <Small className="text-gray-500">
                    Clicks ({analyticsData?.clickRate ? Number(analyticsData.clickRate).toFixed(1) : '0.0'}%)
                  </Small>
                </div>
              </div>

              {/* CTOR Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <ChartBarIcon className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData?.CTOR ? Number(analyticsData.CTOR).toFixed(1) : '0.0'}%
                  </p>
                  <Small className="text-gray-500">CTOR</Small>
                </div>
              </div>
            </div>

            {/* Analytics Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <H3 className="mb-0">Engagement Over Time</H3>
                <Menu as="div" className="relative">
                  <Menu.Button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    {timeSeriesTimeframe === '7days' ? 'Last 7 Days' : 
                     timeSeriesTimeframe === '30days' ? 'Last 30 Days' : 
                     timeSeriesTimeframe === '90days' ? 'Last 90 Days' : 'All Time'}
                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {[
                        { value: '7days', label: 'Last 7 Days' },
                        { value: '30days', label: 'Last 30 Days' },
                        { value: '90days', label: 'Last 90 Days' },
                        { value: 'alltime', label: 'All Time' }
                      ].map((option) => (
                        <Menu.Item key={option.value}>
                          {({ active }) => (
                            <button
                              onClick={() => setTimeSeriesTimeframe(option.value)}
                              className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700 w-full text-left`}
                            >
                              {option.label}
                            </button>
                          )}
                        </Menu.Item>
                      ))}
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
              
              {(analyticsData && (analyticsData.opensCount ?? analyticsData.opens ?? 0) === 0 && (analyticsData.clicksCount ?? analyticsData.clicks ?? 0) === 0) ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ChartBarIcon className="w-12 h-12 text-gray-400 mb-4" />
                  <H4 className="mb-2">No engagement data yet</H4>
                  <Body className="text-gray-500">Your metrics will appear here after recipients open or click your emails.</Body>
                </div>
              ) : (
                <div className="h-80">
                  <CampaignTimeSeriesChart
                    timeSeriesData={timeSeriesData || { labels: [], emailsSent: [], opens: [], clicks: [] }}
                    isLoading={!timeSeriesData}
                    isError={!!error}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Test Email Modal */}
      {showTestEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-auto">
            <div className="p-6">
              <H3 className="mb-4">Send Test Email</H3>
              <Body className="text-gray-600 mb-4">Enter the recipient email address to send a test version of this campaign.</Body>
              <input
                type="email"
                value={testEmailRecipient}
                onChange={(e) => setTestEmailRecipient(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="recipient@example.com"
              />
            </div>
            <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowTestEmailModal(false)}
                disabled={isSendingTestEmail}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <DomainDependentButton
                onClick={handleSendTestEmail}
                reason="send a test email"
                disabled={isSendingTestEmail}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
              >
                {isSendingTestEmail ? 'Sending...' : 'Send Test'}
              </DomainDependentButton>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-auto">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <CalendarIcon className="w-6 h-6 text-indigo-600" />
                </div>
                <H3 className="mb-0">Reschedule Campaign</H3>
              </div>
              <Body className="text-gray-600 mb-4">Choose a new date and time for this campaign.</Body>
              <input
                type="datetime-local"
                value={newSchedule}
                onChange={(e) => setNewSchedule(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await axios.post(`/api/campaigns/${campaign._id}/reschedule`, { scheduledAt: newSchedule });
                    toast.success('Campaign rescheduled successfully');
                    setShowRescheduleModal(false);
                    setNewSchedule('');
                    fetchCampaignDetails();
                  } catch (e) {
                    toast.error(e.response?.data?.message || 'Failed to reschedule campaign');
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Campaign Modal */}
      {showSendCampaignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-auto">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <PaperAirplaneIcon className="w-6 h-6 text-blue-600" />
                </div>
                <H3 className="mb-0">Send Campaign</H3>
              </div>
              <Body className="text-gray-600 mb-4">
                Are you sure you want to send this campaign to all subscribers? This action cannot be undone.
              </Body>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <Small className="text-yellow-800">
                  <strong>Note:</strong> Once sent, the campaign cannot be modified or cancelled.
                </Small>
              </div>
            </div>
            <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowSendCampaignModal(false)}
                disabled={isSendingCampaign}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <DomainDependentButton
                onClick={handleSendCampaign}
                reason="send this campaign"
                disabled={isSendingCampaign}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
              >
                {isSendingCampaign ? 'Sending...' : 'Send Now'}
              </DomainDependentButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CampaignDetails;
