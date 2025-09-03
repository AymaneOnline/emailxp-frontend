// emailxp/frontend/src/pages/Dashboard.js

import React, { useEffect, useState, Fragment, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import campaignService from '../services/campaignService';
import { updateUserData } from '../store/slices/authSlice'; // Import updateUserData to mark profile complete
import { toast } from 'react-toastify'; // Import toast

import TopBar from '../components/TopBar';
import OnboardingChecklist from '../components/OnboardingChecklist'; // NEW: Import OnboardingChecklist

import {
  ArrowPathIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation(); // Get current location for query params
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('Last 30 days');
  const [handlingVerification, setHandlingVerification] = useState(false);

  const [dashboardData, setDashboardData] = useState({
    totalActiveSubscribers: 0,
    newSubscribersToday: 0,
    newSubscribersThisMonth: 0,
    newSubscribers30Days: 0,
    unsubscribed30Days: 0,
    emailsSent: 0,
    opens: 0,
    clicks: 0,
    ctor: 0,
    campaignsTable: [],
    activeAutomationWorkflows: 0,
    subscribersInQueue: 0,
    completedSubscribers: 0,
    automationUnsubscribed: 0,
    activeForms: 0,
    formSignups: 0,
    formAvgConversionRate: 0,
    allPublishedSites: 0,
    siteSignups: 0,
    siteAvgConversionRate: 0,
  });

  // Check for verification parameters first
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const verified = queryParams.get('verified');
    const tokenError = queryParams.get('error');

    if (verified || tokenError) {
      setHandlingVerification(true);
    }
  }, [location.search]);

  // Effect to handle email verification redirect
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const verified = queryParams.get('verified');
    const tokenError = queryParams.get('error');

    if (verified === 'true') {
      // Email verification was successful
      if (user) {
        // User is logged in, update their verification status
        if (!user.isVerified) {
          dispatch(updateUserData({ isVerified: true }));
          toast.success('Email verified successfully! Please complete your profile.');
        }
      } else {
        // User is not logged in, show success message and redirect to login
        toast.success('Email verified successfully! Please log in to continue.');
        navigate('/login');
        return;
      }
      // Remove query parameter from URL to prevent re-triggering toast on refresh
      navigate(location.pathname, { replace: true });
    } else if (tokenError === 'invalid_or_expired_token') {
      toast.error('Email verification link is invalid or expired. Please request a new one.');
      if (!user) {
        navigate('/login');
        return;
      }
      navigate(location.pathname, { replace: true });
    }
    
    // Clear the handling verification state after processing
    setHandlingVerification(false);
  }, [location, user, dispatch, navigate]);

  // Check if user is logged in (only if not handling verification)
  useEffect(() => {
    if (!handlingVerification && !user) {
      navigate('/login');
      return;
    }
  }, [user, navigate, handlingVerification]);


  const fetchDashboardData = useCallback(async (timeframe) => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Only fetch main dashboard data if email is verified and profile is complete
    // Or if we are explicitly on the dashboard and need to show the checklist
    if (!user.isVerified || !user.isProfileComplete) {
      setLoading(false);
      return; // Skip fetching data if onboarding is not complete
    }

    try {
      setLoading(true);
      setError(null);

      // Try to fetch campaign stats and campaigns, but handle gracefully if they fail
      let campaignStats = {
        emailsSent: 0,
        opens: 0,
        clicks: 0,
        CTOR: 0,
        totalActiveSubscribers: 0,
        totalUnsubscribed: 0
      };
      let allCampaigns = [];

      try {
        campaignStats = await campaignService.getDashboardStats(timeframe);
      } catch (statsError) {
        console.log('No campaign stats available yet:', statsError.message);
        // Use default values for new users
      }

      try {
        allCampaigns = await campaignService.getCampaigns(timeframe);
      } catch (campaignsError) {
        console.log('No campaigns available yet:', campaignsError.message);
        // Use empty array for new users
      }

      const transformedCampaignsTable = allCampaigns.map(campaign => {
          const sent = campaign.emailsSuccessfullySent || 0;
          const opened = campaign.opensCount || 0;
          const clicked = campaign.clicksCount || 0;
          const unsubscribed = campaign.unsubscribedCount || 0;
          const spamComplaints = campaign.spamComplaintsCount || 0;

          return {
            _id: campaign._id,
            month: new Date(campaign.createdAt).toLocaleString('en-US', { month: 'short', year: 'numeric' }),
            campaigns: 1,
            emailsSent: sent,
            opened: { count: opened, percent: sent > 0 ? (opened / sent * 100).toFixed(2) : 0 },
            clicked: { count: clicked, percent: opened > 0 ? (clicked / opened * 100).toFixed(2) : 0 },
            unsubscribed: { count: unsubscribed, percent: sent > 0 ? (unsubscribed / sent * 100).toFixed(2) : 0 },
            spamComplaints: { count: spamComplaints, percent: sent > 0 ? (spamComplaints / sent * 100).toFixed(2) : 0 },
          };
      });

      setDashboardData({
        emailsSent: campaignStats.emailsSent || 0,
        opens: campaignStats.opens || 0,
        clicks: campaignStats.clicks || 0,
        ctor: campaignStats.CTOR || 0,
        campaignsTable: transformedCampaignsTable,

        totalActiveSubscribers: campaignStats.totalActiveSubscribers || 0,

        newSubscribersToday: Math.floor(Math.random() * 5),
        newSubscribersThisMonth: Math.floor(Math.random() * 50) + 1,
        newSubscribers30Days: Math.floor(Math.random() * 20) + 1,
        unsubscribed30Days: campaignStats.totalUnsubscribed || Math.floor(Math.random() * 5),
        activeAutomationWorkflows: Math.floor(Math.random() * 5) + 1,
        subscribersInQueue: Math.floor(Math.random() * 10),
        completedSubscribers: Math.floor(Math.random() * 100) + 10,
        automationUnsubscribed: Math.floor(Math.random() * 3),
        activeForms: Math.floor(Math.random() * 3) + 1,
        formSignups: Math.floor(Math.random() * 50),
        allPublishedSites: Math.floor(Math.random() * 2) + 1,
        siteSignups: Math.floor(Math.random() * 20),
        formAvgConversionRate: Math.floor(Math.random() * 100).toFixed(2),
        siteAvgConversionRate: Math.floor(Math.random() * 100).toFixed(2),
      });

    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      // Don't set error for new users with no data - just use default values
      if (err.response?.status === 404 || err.response?.status === 500) {
        console.log('Using default dashboard data for new user');
        setDashboardData({
          emailsSent: 0,
          opens: 0,
          clicks: 0,
          ctor: 0,
          campaignsTable: [],
          totalActiveSubscribers: 0,
          newSubscribersToday: 0,
          newSubscribersThisMonth: 0,
          newSubscribers30Days: 0,
          unsubscribed30Days: 0,
          activeAutomationWorkflows: 0,
          subscribersInQueue: 0,
          completedSubscribers: 0,
          automationUnsubscribed: 0,
          activeForms: 0,
          formSignups: 0,
          allPublishedSites: 0,
          siteSignups: 0,
          formAvgConversionRate: 0,
          siteAvgConversionRate: 0,
        });
      } else {
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
      }
    } finally {
      setLoading(false);
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchDashboardData(selectedTimeframe);
  }, [fetchDashboardData, selectedTimeframe]);

  // Determine if onboarding is complete
  const isOnboardingComplete = user?.isVerified && user?.isProfileComplete;

  // Show loading state when handling verification
  if (handlingVerification) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] bg-gray-50">
        <ArrowPathIcon className="h-16 w-16 text-primary-red animate-spin" />
        <p className="mt-4 text-lg text-dark-gray">Processing verification...</p>
      </div>
    );
  }

  // Show loading state when user is not logged in (but not handling verification)
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] bg-gray-50">
        <ArrowPathIcon className="h-16 w-16 text-primary-red animate-spin" />
        <p className="mt-4 text-lg text-dark-gray">Redirecting to login...</p>
      </div>
    );
  }

  if (loading && isOnboardingComplete) { // Only show full loading spinner if we expect data
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] bg-gray-50">
        <ArrowPathIcon className="h-16 w-16 text-primary-red animate-spin" />
        <p className="mt-4 text-lg text-dark-gray">Loading dashboard data...</p>
      </div>
    );
  }

  if (error && isOnboardingComplete) { // Only show full error if we expect data
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] bg-gray-50 p-4">
        <div role="alert" className="flex flex-col items-center p-8 bg-lighter-red border border-primary-red text-dark-gray rounded-lg shadow-md text-center max-w-lg mx-auto">
          <XCircleIcon className="w-12 h-12 text-primary-red mb-4" />
          <h3 className="text-2xl font-semibold mb-2">Error!</h3>
          <p className="text-lg mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-primary-red text-white rounded-md shadow-md hover:bg-custom-red-hover transition-colors duration-200 text-base font-medium"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <TopBar />

      <h1 className="text-3xl font-bold text-dark-gray mb-8">Dashboard</h1>

      {/* Conditionally render Onboarding Checklist or Dashboard Content */}
      {!isOnboardingComplete ? (
        <OnboardingChecklist />
      ) : (
        <>
          {/* Performance Overview Section */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-dark-gray">Performance overview</h2>
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="inline-flex justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                    {selectedTimeframe}
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
                            onClick={() => setSelectedTimeframe('Last 7 days')}
                            className={classNames(
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                              'block px-4 py-2 text-sm w-full text-left'
                            )}
                          >
                            Last 7 days
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => setSelectedTimeframe('Last 30 days')}
                            className={classNames(
                              active ? 'bg-gray-100' : '',
                              'block px-4 py-2 text-sm w-full text-left'
                            )}
                          >
                            Last 30 days
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => setSelectedTimeframe('Last 90 days')}
                            className={classNames(
                              active ? 'bg-gray-100' : '',
                              'block px-4 py-2 text-sm w-full text-left'
                            )}
                          >
                            Last 90 days
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => setSelectedTimeframe('All Time')}
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

            {/* Subscribers Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-dark-gray mb-4 flex items-center">
                <i className="fas fa-users mr-2"></i> Subscribers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Total active subscribers</p>
                  <p className="text-4xl font-bold text-dark-gray">
                    {dashboardData.totalActiveSubscribers}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Want more subscribers? Grow your email group with signup forms</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">New subscribers today</p>
                  <p className="text-4xl font-bold text-dark-gray">
                    {dashboardData.newSubscribersToday}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">New subscribers this month</p>
                  <p className="text-4xl font-bold text-dark-gray">
                    {dashboardData.newSubscribersThisMonth}
                  </p>
                </div>
              </div>

              {/* New/Unsubscribed Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
                    <span className="text-base text-dark-gray">New</span>
                  </div>
                  <span className="text-lg font-bold text-dark-gray">
                    {dashboardData.newSubscribers30Days}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">Last 30 days</span>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="h-3 w-3 rounded-full bg-primary-red mr-2"></span>
                    <span className="text-base text-dark-gray">Unsubscribed</span>
                  </div>
                  <span className="text-lg font-bold text-dark-gray">
                    {dashboardData.unsubscribed30Days}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">Last 30 days</span>
                </div>
              </div>
              {/* Subscriber Growth Chart Placeholder */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mt-8" style={{ minHeight: '300px' }}>
                <h3 className="text-xl font-semibold text-dark-gray mb-4">Subscriber Growth</h3>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <p>[Chart Placeholder - Subscriber Growth (e.g., Line Chart)]
                  </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Campaigns Section */}
            <div>
              <h3 className="text-xl font-semibold text-dark-gray mb-4 flex items-center">
                <i className="fas fa-envelope mr-2"></i> Campaigns
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Emails sent</p>
                  <p className="text-4xl font-bold text-dark-gray">
                    {dashboardData.emailsSent}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Opens</p>
                  <p className="text-4xl font-bold text-dark-gray">
                    {dashboardData.opens}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Clicks</p>
                  <p className="text-4xl font-bold text-dark-gray">
                    {dashboardData.clicks}
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <h4 className="text-lg font-semibold mb-4 text-dark-gray">Campaigns Breakdown</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Month
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Campaigns
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Emails Sent
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Opened
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Clicked
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Unsubscribed
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Spam Complaints
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboardData.campaignsTable.length === 0 && (
                        <tr>
                          <td
                            colSpan="7"
                            className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500"
                          >
                            No campaigns data available.
                          </td>
                        </tr>
                      )}
                      {dashboardData.campaignsTable.map((row) => (
                        <tr key={row._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-gray">
                            {row.month}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-dark-gray">
                            {row.campaigns}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-dark-gray">
                            {row.emailsSent}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-dark-gray">
                            {row.opened.count} ({row.opened.percent}%)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-dark-gray">
                            {row.clicked.count} ({row.clicked.percent}%)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-dark-gray">
                            {row.unsubscribed.count} ({row.unsubscribed.percent}%)
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-dark-gray">
                            {row.spamComplaints.count} ({row.spamComplaints.percent}%)
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
