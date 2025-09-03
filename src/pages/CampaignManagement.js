// emailxp/frontend/src/pages/CampaignManagement.js

import React, { useState, useEffect, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { useSelector } from 'react-redux'; // Removed useDispatch as it's not used
import { useNavigate } from 'react-router-dom';
import campaignService from '../services/campaignService';
import { toast } from 'react-toastify';


import {
  ArrowPathIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, EllipsisVerticalIcon } from '@heroicons/react/20/solid';

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

function CampaignManagement() {
  const navigate = useNavigate();
  // Removed unused dispatch
  const { user } = useSelector((state) => state.auth);

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('Last 30 days');
  const [kebabMenu, setKebabMenu] = useState({ open: false, id: null, top: 0, left: 0 });

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await campaignService.getCampaigns(selectedTimeframe);
        setCampaigns(data);
      } catch (err) {
        console.error("Failed to fetch campaigns:", err);
        setError(err.response?.data?.message || "Failed to load campaigns.");
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [user?.id, navigate, selectedTimeframe]);

  const handleCreateCampaign = () => {
    navigate('/campaigns/new');
  };

  const handleCampaignKebabMenu = async (campaignId, action) => {
    if (action === 'Edit') {
      navigate(`/campaigns/edit/${campaignId}`);
    } else if (action === 'Delete') {
      if (window.confirm(`Are you sure you want to delete campaign ${campaignId}?`)) {
        try {
          await campaignService.deleteCampaign(campaignId);
          setCampaigns(campaigns.filter(campaign => campaign._id !== campaignId));
          toast.success("Campaign deleted successfully!");
        } catch (err) {
          console.error("Failed to delete campaign:", err);
          toast.error(err.response?.data?.message || "Error deleting campaign.");
        }
      }
    } else if (action === 'View Analytics') {
      navigate(`/campaigns/details/${campaignId}`);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const statusMatch = filterStatus === 'All' || (campaign.status || '').toLowerCase() === filterStatus.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    const groupNames = Array.isArray(campaign.groups) && campaign.groups.length > 0
      ? campaign.groups.map(g => (g.name || g)).join(', ')
      : (campaign.group?.name || '');
    const searchMatch = searchTerm === '' ||
      (campaign.name && campaign.name.toLowerCase().includes(searchLower)) ||
      (campaign.subject && campaign.subject.toLowerCase().includes(searchLower)) ||
      (groupNames && groupNames.toLowerCase().includes(searchLower));

    return statusMatch && searchMatch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] bg-gray-50">
        <ArrowPathIcon className="h-16 w-16 text-primary-red animate-spin" />
        <p className="mt-4 text-lg text-dark-gray">Loading campaigns...</p>
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
      <h1 className="text-3xl font-bold text-dark-gray mb-8">Campaigns</h1>

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-dark-gray">All Campaigns</h2>
          <button
            onClick={handleCreateCampaign}
            className="px-6 py-2 bg-primary-red text-white rounded-md shadow-md hover:bg-custom-red-hover transition-colors duration-200 text-base font-medium"
          >
            Create campaign
          </button>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <Menu.Button className="inline-flex justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                {filterStatus === 'All' ? 'All Statuses' : filterStatus}
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
              <Menu.Items className="absolute left-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  {['All', 'Draft', 'Scheduled', 'Sending', 'Sent', 'Cancelled', 'Failed'].map((status) => (
                    <Menu.Item key={status}>
                      {({ active }) => (
                        <button
                          onClick={() => setFilterStatus(status)}
                          className={classNames(active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm w-full text-left')}
                        >
                          {status}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>

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
                  {['Last 7 days', 'Last 30 days', 'Last 90 days', 'All Time'].map((timeframe) => (
                    <Menu.Item key={timeframe}>
                      {({ active }) => (
                        <button
                          onClick={() => setSelectedTimeframe(timeframe)}
                          className={classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'block px-4 py-2 text-sm w-full text-left'
                          )}
                        >
                          {timeframe}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>

          <div className="relative flex-grow max-w-xs ml-auto">
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-red focus:ring-primary-red sm:text-sm p-2.5"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.346l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Groups</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metrics</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCampaigns.length > 0 ? (
                filteredCampaigns.map((campaign) => (
                  <tr key={campaign._id} className="group hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-gray">{campaign.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{campaign.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{
                      Array.isArray(campaign.groups) && campaign.groups.length > 0
                        ? campaign.groups.map(g => g.name || g).join(', ')
                        : (campaign.group?.name || 'N/A')
                    }</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClasses(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col text-xs text-gray-600">
                        <span>Sent: {campaign.emailsSuccessfullySent ?? 0}</span>
                        <span>Opens: {campaign.opens ?? 0}</span>
                        <span>Clicks: {campaign.clicks ?? 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(campaign.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative overflow-visible">
                      
                      <button
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const menuWidth = 192; // w-48
                          const menuHeight = 200;
                          const gap = 6;
                          let top = rect.bottom + window.scrollY + gap;
                          const left = Math.min(
                            rect.left + window.scrollX,
                            window.scrollX + window.innerWidth - menuWidth - 8
                          );
                          if (top + menuHeight > window.scrollY + window.innerHeight) {
                            top = rect.top + window.scrollY - menuHeight - gap;
                          }
                          setKebabMenu({ open: true, id: campaign._id, top, left });
                        }}
                        className="inline-flex items-center text-gray-400 hover:text-gray-600"
                        aria-haspopup="true"
                        aria-expanded={kebabMenu.open && kebabMenu.id === campaign._id}
                        aria-label="Open actions menu"
                      >
                        <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
                      </button>

                      {kebabMenu.open && kebabMenu.id === campaign._id && ReactDOM.createPortal(
                        <div
                          className="fixed inset-0 z-[1000]"
                          onClick={() => setKebabMenu({ open: false, id: null, top: 0, left: 0 })}
                          onKeyDown={(e) => { if (e.key === 'Escape') setKebabMenu({ open: false, id: null, top: 0, left: 0 }); }}
                          role="dialog"
                          aria-modal="true"
                        >
                          <div
                            className="absolute w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                            style={{ top: kebabMenu.top, left: kebabMenu.left }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="py-1">
                              <button
                                onClick={() => { navigate(`/campaigns/details/${campaign._id}`); setKebabMenu({ open: false, id: null, top: 0, left: 0 }); }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => { handleCampaignKebabMenu(campaign._id, 'View Analytics'); setKebabMenu({ open: false, id: null, top: 0, left: 0 }); }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                View Analytics
                              </button>
                              <button
                                onClick={() => { handleCampaignKebabMenu(campaign._id, 'Edit'); setKebabMenu({ open: false, id: null, top: 0, left: 0 }); }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => { handleCampaignKebabMenu(campaign._id, 'Delete'); setKebabMenu({ open: false, id: null, top: 0, left: 0 }); }}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>,
                        document.body
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No campaigns found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CampaignManagement;
