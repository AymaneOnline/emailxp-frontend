// emailxp/frontend/src/pages/CampaignDetails.js

import React, { useState, useEffect, Fragment, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import campaignService from '../services/campaignService';
import axios from 'axios';
import { toast } from 'react-toastify';
import CampaignTimeSeriesChart from '../components/CampaignTimeSeriesChart';

import {
  ArrowPathIcon,
  XCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function getStatusBadgeClasses(status) {
  switch ((status || '').toLowerCase()) {
    case 'draft':
      return 'bg-yellow-100 text-yellow-800';
    case 'scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'sending':
      return 'bg-indigo-100 text-indigo-800';
    case 'sent':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-gray-200 text-gray-700';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
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
      toast.error(err.response?.data?.message || "Failed to send campaign.");
    } finally {
      setIsSendingCampaign(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] bg-gray-50">
        <ArrowPathIcon className="h-16 w-16 text-primary-red animate-spin" />
        <p className="mt-4 text-lg text-dark-gray">Loading campaign details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] bg-gray-50 p-4">
        <div role="alert" className="flex flex-col items-center p-8 bg-lighter-red border border-primary-red text-dark-gray rounded-lg shadow-md text-center max-w-lg mx-auto">
          <XCircleIcon className="w-12 h-12 text-primary-red mb-4" />
          <h3 className="text-2xl font-semibold mb-2">Error!</h3>
          <p className="text-lg mb-6">{error}</p>
          <button
            onClick={() => navigate('/campaigns-overview')}
            className="px-6 py-2 bg-primary-red text-white rounded-md shadow-md hover:bg-custom-red-hover transition-colors duration-200 text-base font-medium"
          >
            Back to Campaigns
          </button>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] bg-gray-50">
        <p className="text-lg text-dark-gray">Campaign not found.</p>
        <button
          onClick={() => navigate('/campaigns-overview')}
          className="mt-4 px-6 py-2 bg-primary-red text-white rounded-md shadow-md hover:bg-custom-red-hover transition-colors duration-200 text-base font-medium"
        >
          Back to Campaigns
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <h1 className="text-3xl font-bold text-dark-gray mb-8">Campaign Details: {campaign.name}</h1>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-dark-gray">Campaign Overview</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowTestEmailModal(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition-colors duration-200 text-base font-medium"
            >
              Send Test Email
            </button>
            <button
              onClick={() => navigate(`/campaigns/edit/${campaign._id}`)}
              className="px-6 py-2 bg-gray-600 text-white rounded-md shadow-md hover:bg-gray-700 transition-colors duration-200 text-base font-medium"
            >
              Edit Campaign
            </button>
            <button
              onClick={() => setShowSendCampaignModal(true)}
              className={`px-6 py-2 rounded-md shadow-md transition-colors duration-200 text-base font-medium ${['sent','cancelled','failed','sending'].includes((campaign.status||'').toLowerCase()) ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-primary-red text-white hover:bg-custom-red-hover'}`}
              disabled={['sent','cancelled','failed','sending'].includes((campaign.status||'').toLowerCase())}
            >
              Send Campaign
            </button>
            {campaign.status === 'scheduled' && campaign.scheduledAt && new Date(campaign.scheduledAt) > new Date() && (
              <>
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
                  className="px-6 py-2 bg-yellow-600 text-white rounded-md shadow-md hover:bg-yellow-700 transition-colors duration-200 text-base font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowRescheduleModal(true)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md shadow-md hover:bg-indigo-700 transition-colors duration-200 text-base font-medium"
                >
                  Reschedule
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-gray-600"><strong>Subject:</strong> {campaign.subject}</p>
            <p className="text-gray-600"><strong>Groups:</strong> {Array.isArray(campaign.groups) && campaign.groups.length > 0 ? campaign.groups.map(g => g.name || g).join(', ') : (campaign.group?.name || 'N/A')}</p>
            <p className="text-gray-600"><strong>Status:</strong> {' '}
              <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded ${getStatusBadgeClasses(campaign.status)}`}>
                {campaign.status}
              </span>
            </p>
            <p className="text-gray-600"><strong>Created At:</strong> {new Date(campaign.createdAt).toLocaleString()}</p>
            <p className="text-gray-600"><strong>Last Updated:</strong> {new Date(campaign.updatedAt).toLocaleString()}</p>
            {typeof campaign.totalRecipients === 'number' && (
              <p className="text-gray-600"><strong>Total Recipients:</strong> {campaign.totalRecipients}</p>
            )}
          </div>
          <div>
            <p className="text-gray-600"><strong>Emails Sent:</strong> {analyticsData?.emailsSuccessfullySent ?? analyticsData?.emailsSent ?? 0}</p>
            <p className="text-gray-600"><strong>Opens:</strong> {(analyticsData?.opensCount ?? analyticsData?.opens ?? 0)} ({analyticsData?.openRate ? Number(analyticsData.openRate).toFixed(2) : '0.00'}%)</p>
            <p className="text-gray-600"><strong>Clicks:</strong> {(analyticsData?.clicksCount ?? analyticsData?.clicks ?? 0)} ({analyticsData?.clickRate ? Number(analyticsData.clickRate).toFixed(2) : '0.00'}%)</p>
            <p className="text-gray-600"><strong>CTOR:</strong> {analyticsData?.CTOR ? Number(analyticsData.CTOR).toFixed(2) : '0.00'}%</p>
            <p className="text-gray-600"><strong>Unsubscribed:</strong> {analyticsData?.unsubscribedCount ?? analyticsData?.unsubscribed ?? 0}</p>
          </div>
        </div>

        {/* Time Series Chart Placeholder */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mt-8" style={{ minHeight: '300px' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-dark-gray">Engagement Over Time</h3>
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="inline-flex justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                  {timeSeriesTimeframe === '7days' ? 'Last 7 Days' : timeSeriesTimeframe === '30days' ? 'Last 30 Days' : timeSeriesTimeframe === '90days' ? 'Last 90 Days' : 'All Time'}
                  <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => setTimeSeriesTimeframe('7days')}
                          className={classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'block px-4 py-2 text-sm w-full text-left'
                          )}
                        >
                          Last 7 Days
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => setTimeSeriesTimeframe('30days')}
                          className={classNames(
                            active ? 'bg-gray-100' : '',
                            'block px-4 py-2 text-sm w-full text-left'
                          )}
                        >
                          Last 30 Days
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => setTimeSeriesTimeframe('90days')}
                          className={classNames(
                            active ? 'bg-gray-100' : '',
                            'block px-4 py-2 text-sm w-full text-left'
                          )}
                        >
                          Last 90 Days
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => setTimeSeriesTimeframe('alltime')}
                          className={classNames(
                            active ? 'bg-gray-100' : '',
                            'block px-4 py-2 text-sm w-full text-left'
                          )}
                        >
                          All Time
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
          {(analyticsData && (analyticsData.opensCount ?? analyticsData.opens ?? 0) === 0 && (analyticsData.clicksCount ?? analyticsData.clicks ?? 0) === 0 && (analyticsData.unsubscribedCount ?? analyticsData.unsubscribed ?? 0) === 0) && (
            <div className="text-center text-gray-500 mb-4">No data yet. Your metrics will appear here after recipients open or click your emails.</div>
          )}
          <CampaignTimeSeriesChart
            timeSeriesData={timeSeriesData || { labels: [], emailsSent: [], opens: [], clicks: [] }}
            isLoading={!timeSeriesData}
            isError={!!error}
          />
        </div>
      </div>

      {/* Test Email Modal */}
      {showTestEmailModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Send Test Email</h3>
            <p className="mb-4 text-gray-700">Enter the recipient email address for the test campaign.</p>
            <input
              type="email"
              value={testEmailRecipient}
              onChange={(e) => setTestEmailRecipient(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
              placeholder="recipient@example.com"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowTestEmailModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                disabled={isSendingTestEmail}
              >
                Cancel
              </button>
              <button
                onClick={handleSendTestEmail}
                className="px-4 py-2 bg-primary-red text-white rounded-md hover:bg-custom-red-hover"
                disabled={isSendingTestEmail}
              >
                {isSendingTestEmail ? 'Sending...' : 'Send Test'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Reschedule Campaign</h3>
            <input
              type="datetime-local"
              value={newSchedule}
              onChange={(e) => setNewSchedule(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
            />
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await axios.post(`/api/campaigns/${campaign._id}/reschedule`, { scheduledAt: newSchedule });
                    toast.success('Campaign rescheduled');
                    setShowRescheduleModal(false);
                    setNewSchedule('');
                    fetchCampaignDetails();
                  } catch (e) {
                    toast.error(e.response?.data?.message || 'Failed to reschedule campaign');
                  }
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Campaign Modal */}
      {showSendCampaignModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Confirm Send Campaign</h3>
            <p className="mb-4 text-gray-700">Are you sure you want to send this campaign to all subscribers in the group?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowSendCampaignModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                disabled={isSendingCampaign}
              >
                Cancel
              </button>
              <button
                onClick={handleSendCampaign}
                className="px-4 py-2 bg-primary-red text-white rounded-md hover:bg-custom-red-hover"
                disabled={isSendingCampaign}
              >
                {isSendingCampaign ? 'Sending...' : 'Send Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CampaignDetails;
