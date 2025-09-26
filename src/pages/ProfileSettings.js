// emailxp/frontend/src/pages/ProfileSettings.js

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import { updateUserData } from '../store/slices/authSlice';
import { toast } from 'react-toastify';
import { track } from '../services/analyticsClient';
import { normalizeWebsiteFrontend } from '../utils/website';
import { getBackendUrl } from '../utils/getBackendUrl';
import { BASE_BACKEND_URL } from '../services/api';
import { getAuthToken } from '../utils/authToken';
import api from '../services/api';
import { countries } from '../constants/countries';
import { createDomain } from '../services/domainService';


import {
  ArrowPathIcon,
  XCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import DomainManagement from './DomainManagement';
import SettingsLayout from '../components/layout/SettingsLayout';

// Small presentational helper for label/value pairs in account panel
const InfoItem = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold">{label}</p>
    <p className="text-sm text-gray-900 dark:text-gray-100 break-all">{value || '—'}</p>
  </div>
);

function ProfileSettings() {
  // Version marker – now logged only once on mount to avoid spam
  const VERSION = 'v2025.09.26-loopfix1';
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const userId = user?._id || user?.id || null;
  const fetchedRef = useRef(false);
  // Avatar removed – no file input ref needed

  const [formData, setFormData] = useState({
    companyOrOrganization: '',
    name: '',
    email: '',
    website: '',
    industry: '',
    bio: '',
    address: '',
    city: '',
    country: '',
  });
  const [initialFormData, setInitialFormData] = useState(null);
  const [justSaved, setJustSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timedOut, setTimedOut] = useState(false);
  const loadingStartRef = useRef(Date.now());
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  // Avatar state removed
  // Removed completion banner in favor of immediate redirect after first completion
  // Removed old completion banner state (legacy)
  const announceRef = useRef(null);
  const pageHeadingRef = useRef(null);
  const [websiteInput, setWebsiteInput] = useState('');
  const [websiteError, setWebsiteError] = useState('');
  const [websitePreview, setWebsitePreview] = useState('');

  // Account deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Domain creation modal state
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [creatingDomain, setCreatingDomain] = useState(false);

  const industries = [
    "Technology", "Marketing", "E-commerce", "Education", "Healthcare", "Non-profit", "Other"
  ];

  // Tab state synced with hash (#general | #account | #domains | #notifications) – must be before any early returns
  const getInitialTab = () => {
    if (typeof window === 'undefined') return 'general';
    if (window.location.hash === '#account') return 'account';
    if (window.location.hash === '#domains') return 'domains';
    if (window.location.hash === '#notifications') return 'notifications';
    return 'general';
  };
  const [activeTab, setActiveTab] = useState(getInitialTab());

  const switchTab = useCallback((tab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const targetHash = tab === 'account' ? '#account' : tab === 'domains' ? '#domains' : tab === 'notifications' ? '#notifications' : '#general';
      if (window.location.hash !== targetHash) {
        window.history.replaceState({}, '', targetHash);
      }
      requestAnimationFrame(() => {
        const id = tab === 'domains' ? 'domains-section' : tab === 'account' ? 'account-section' : tab === 'notifications' ? 'notifications-section' : 'general-section';
        const el = document.getElementById(id);
        if (el) {
          try { el.focus({ preventScroll: true }); } catch { el.focus?.(); }
        }
      });
    }
  }, []);

  // Hash/tab listener
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onHashChange = () => {
      if (window.location.hash === '#account') setActiveTab('account');
      else if (window.location.hash === '#domains') setActiveTab('domains');
      else if (window.location.hash === '#notifications') setActiveTab('notifications');
      else setActiveTab('general');
    };
    window.addEventListener('hashchange', onHashChange);
    const onOpenDomains = () => {
      setActiveTab('domains');
      if (window.location.hash !== '#domains') window.history.replaceState({}, '', '#domains');
      setTimeout(() => {
        const el = document.getElementById('domains-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          el.focus?.();
        }
      }, 30);
    };
    window.addEventListener('open-domains-tab', onOpenDomains);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('open-domains-tab', onOpenDomains);
    };
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setTimedOut(false);
      setError(null);
      setSuccessMessage(null);
      const profileData = await userService.getUserProfile();
      let initialWebsite = profileData.website || '';
      if (!initialWebsite) {
        try {
          const orgResp = await api.get('/organizations/current');
          if (orgResp.data?.website) initialWebsite = orgResp.data.website;
        } catch (_) { /* silent */ }
      }
      const nextData = {
        companyOrOrganization: profileData.companyOrOrganization || '',
        name: profileData.name || '',
        email: profileData.email || '',
        website: initialWebsite,
        industry: profileData.industry || '',
        bio: profileData.bio || '',
        address: profileData.address || '',
        city: profileData.city || '',
        country: profileData.country || '',
      };
      setFormData(nextData);
      setInitialFormData(nextData);
      setWebsiteInput(initialWebsite);
      validateAndPreviewWebsite(initialWebsite);
      // Only dispatch if key fields changed to avoid triggering effect loops
      try {
        if (user) {
          const keys = ['name','companyOrOrganization','isProfileComplete','website','industry','bio','address','city','country'];
          let changed = false;
          for (const k of keys) {
            if ((user[k] || '') !== (profileData[k] || '')) { changed = true; break; }
          }
          if (changed) dispatch(updateUserData(profileData));
        } else {
          dispatch(updateUserData(profileData));
        }
      } catch {}
    } catch (err) {
      const status = err?.response?.status;
      console.error('Error fetching profile:', err.response?.data || err.message);
      if (status === 401 || status === 403) {
        setError('Your session expired. Please log in again.');
        toast.error('Session expired – please log in again.');
        navigate('/login');
      } else {
        setError(err?.response?.data?.message || 'Failed to load profile data.');
        toast.error(err?.response?.data?.message || 'Failed to load profile data.');
      }
    } finally {
      setLoading(false);
    }
  }, [dispatch, navigate, user]);

  // Initial fetch & verification toast
  useEffect(() => {
    // Log version once
    console.info('ProfileSettings component version:', VERSION);
  }, []);

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    if (fetchedRef.current) return; // prevent repeated fetches when user object reference changes
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('verified') === 'true') {
        toast.success('Email verified successfully!');
        url.searchParams.delete('verified');
        window.history.replaceState({}, '', url.toString());
      }
    }
    loadingStartRef.current = Date.now();
    // Early probe (non-blocking) to log network issues quickly
    (async () => {
      try {
        const backend = getBackendUrl();
        const url = backend ? backend.replace(/\/$/, '') + '/api/users/profile' : '/api/users/profile';
        const resp = await fetch(url, { headers: getAuthToken() ? { Authorization: 'Bearer ' + getAuthToken() } : {} });
        if (!resp.ok) {
          console.warn('Early profile probe failed', resp.status, resp.statusText);
        }
      } catch (e) {
        console.warn('Early profile probe network error', e.message);
      }
    })();
    fetchedRef.current = true;
    fetchProfile();
  }, [userId, fetchProfile, navigate]);

  // Timeout watcher (8s)
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => { if (loading) setTimedOut(true); }, 8000);
    return () => clearTimeout(t);
  }, [loading]);

  // Dirty state tracking (placed at top level, after initial data fetching effect)
  const isDirty = useMemo(() => {
    if (!initialFormData) return false;
    const keys = ['companyOrOrganization','name','email','website','industry','bio','address','city','country'];
    return keys.some(k => (formData[k] || '') !== (initialFormData[k] || ''));
  }, [formData, initialFormData]);

  // Transient saved indicator
  useEffect(() => {
    if (!justSaved) return;
    const t = setTimeout(() => setJustSaved(false), 2500);
    return () => clearTimeout(t);
  }, [justSaved]);

  // Warn on page unload if unsaved changes exist
  useEffect(() => {
    const handler = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'website') {
      setWebsiteInput(value);
      validateAndPreviewWebsite(value);
    }
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  function validateAndPreviewWebsite(raw) {
    setWebsiteError('');
    setWebsitePreview('');
    const val = raw.trim();
    if (!val) return; // empty allowed
    // Add scheme if missing for preview only
    let candidate = /^https?:\/\//i.test(val) ? val : 'https://' + val;
    try {
      const url = new URL(candidate);
      if (!/^https?:$/i.test(url.protocol)) throw new Error('Unsupported scheme');
      url.hash = '';
      url.search = '';
      if (url.pathname !== '/' && url.pathname.endsWith('/')) {
        url.pathname = url.pathname.replace(/\/+$/, '');
        if (url.pathname === '') url.pathname = '/';
      }
      url.hostname = url.hostname.toLowerCase();
      if ((url.protocol === 'https:' && url.port === '443') || (url.protocol === 'http:' && url.port === '80')) {
        url.port = '';
      }
      setWebsitePreview(url.toString());
    } catch (e) {
      setWebsiteError('Invalid URL');
    }
  }

  const handleWebsiteBlur = () => {
    if (websitePreview && !websiteError) {
      setFormData(prev => ({ ...prev, website: websitePreview }));
      setWebsiteInput(websitePreview);
    }
  };

  // Avatar upload handlers removed – ensure no lingering references

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
  setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Check if the profile was incomplete before this update.
    const wasProfileIncomplete = !user.isProfileComplete;

    try {
      // Call the backend service to update the user profile.
      // Pass the complete formData object, including new fields.
      // Ensure we submit canonical website (if any)
      let submitData = { ...formData };
      if (submitData.website) {
        try {
          submitData.website = normalizeWebsiteFrontend(submitData.website);
        } catch (e) {
          setLoading(false);
            setError(e.message);
          toast.error(e.message);
          return;
        }
      }

      const websiteBefore = user.website || '';
  const updatedProfile = await userService.updateUserProfile(submitData);

      // Dispatch the Redux action to update the user data in the store.
      // We now explicitly set isProfileComplete to true.
      dispatch(updateUserData({ ...updatedProfile, isProfileComplete: true }));
      // Fire analytics event if website changed (domain only)
      const after = updatedProfile.website || '';
      if (after && after !== websiteBefore) {
        try {
          const domain = new URL(after).hostname;
          track('profile.website.changed', { domain });
        } catch (_) { /* ignore */ }
      }
      toast.success('Profile updated successfully!');

      // New logic: redirect immediately on first completion
      if (wasProfileIncomplete) {
        track('profile.completed', {});
        navigate('/dashboard');
        return;
      }
      setSuccessMessage('Profile updated successfully!');
      setInitialFormData({
        companyOrOrganization: updatedProfile.companyOrOrganization || '',
        name: updatedProfile.name || '',
        email: updatedProfile.email || '',
        website: updatedProfile.website || '',
        industry: updatedProfile.industry || '',
        bio: updatedProfile.bio || '',
        address: updatedProfile.address || '',
        city: updatedProfile.city || '',
        country: updatedProfile.country || '',
      });
      setJustSaved(true);
      setTimeout(() => {
        announceRef.current && announceRef.current.focus();
      }, 50);

    } catch (err) {
      console.error('Error updating profile:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to update profile.');
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  // Defer early return until after all hooks declared above
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen space-y-4">
        <ArrowPathIcon className="h-12 w-12 animate-spin text-primary-red" />
        <p className="text-sm text-gray-600">Loading your profile...</p>
        <div className="text-[10px] text-gray-500 mt-2">
          <p>Backend URL (detected): {BASE_BACKEND_URL || '(relative /api)'}</p>
          <p>Token present: {getAuthToken() ? 'yes' : 'no'}</p>
        </div>
        {timedOut && (
          <div className="text-center space-y-3">
            <p className="text-xs text-red-600 max-w-xs">This is taking longer than expected. It could be a network issue, missing backend URL configuration, or an expired session.</p>
            <button
              type="button"
              onClick={() => fetchProfile()}
              className="px-4 py-2 text-sm rounded-md bg-primary-red text-white hover:bg-custom-red-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-red"
            >Retry</button>
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        )}
      </div>
    );
  }

  // Checklist & progress calculation
  const checklist = [
    { key: 'companyOrOrganization', label: 'Organization', done: !!formData.companyOrOrganization },
    { key: 'name', label: 'Name', done: !!formData.name },
    { key: 'industry', label: 'Industry', done: !!formData.industry },
    { key: 'bio', label: 'Bio', done: !!formData.bio },
  ];
  const completed = checklist.filter(c => c.done).length;
  const progressPct = Math.round((completed / checklist.length) * 100);

  // (tab hooks moved above early return)

  const tabsBar = (
    <div
      role="tablist"
      aria-label="Settings sections"
      className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-2 flex items-center gap-2 text-sm font-medium"
      onKeyDown={(e)=>{
        const order=['general','account','domains','notifications'];
        const currentIndex = order.indexOf(activeTab);
        if(currentIndex===-1) return;
        if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){
          e.preventDefault();
        }
        if(e.key==='ArrowRight'){
          const next = order[(currentIndex+1)%order.length];
          switchTab(next); document.getElementById(`settings-tab-${next}`)?.focus();
        } else if(e.key==='ArrowLeft'){
          const prev = order[(currentIndex-1+order.length)%order.length];
          switchTab(prev); document.getElementById(`settings-tab-${prev}`)?.focus();
        } else if(e.key==='Home'){
          switchTab(order[0]); document.getElementById(`settings-tab-${order[0]}`)?.focus();
        } else if(e.key==='End'){
          switchTab(order[order.length-1]); document.getElementById(`settings-tab-${order[order.length-1]}`)?.focus();
        }
      }}
    >
      <button id="settings-tab-general" role="tab" aria-selected={activeTab==='general'} aria-controls="general-section" tabIndex={activeTab==='general'?0:-1} onClick={()=>switchTab('general')} className={(activeTab==='general' ? 'bg-primary-red text-white ' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 ') + 'px-3 py-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-red'}>General</button>
      <button id="settings-tab-account" role="tab" aria-selected={activeTab==='account'} aria-controls="account-section" tabIndex={activeTab==='account'?0:-1} onClick={()=>switchTab('account')} className={(activeTab==='account' ? 'bg-primary-red text-white ' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 ') + 'px-3 py-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-red'}>Account</button>
      <button id="settings-tab-domains" role="tab" aria-selected={activeTab==='domains'} aria-controls="domains-section" tabIndex={activeTab==='domains'?0:-1} onClick={()=>switchTab('domains')} className={(activeTab==='domains' ? 'bg-primary-red text-white ' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 ') + 'px-3 py-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-red'}>Domains</button>
      <button id="settings-tab-notifications" role="tab" aria-selected={activeTab==='notifications'} aria-controls="notifications-section" tabIndex={activeTab==='notifications'?0:-1} onClick={()=>switchTab('notifications')} className={(activeTab==='notifications' ? 'bg-primary-red text-white ' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 ') + 'px-3 py-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-red'}>Notifications</button>
    </div>
  );

  const generalPanel = activeTab === 'general' && (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-6 relative" id="general-section" role="tabpanel" aria-labelledby="settings-tab-general">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">General Settings</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Customize your application preferences.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Theme Section */}
        <fieldset className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 space-y-4">
          <legend className="px-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Appearance</legend>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Theme</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  className="h-4 w-4 text-primary-red focus:ring-primary-red border-gray-300"
                  defaultChecked
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">Light</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  className="h-4 w-4 text-primary-red focus:ring-primary-red border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">Dark</span>
              </label>
            </div>
          </div>
        </fieldset>

        {/* Language Section */}
        <fieldset className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 space-y-4">
          <legend className="px-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Language</legend>
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">Application Language</label>
            <select
              id="language"
              name="language"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-red focus:border-primary-red sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              defaultValue="english"
            >
              <option value="english">English</option>
              <option value="french">Français</option>
              <option value="arabic">العربية</option>
            </select>
          </div>
        </fieldset>
      </div>
    </div>
  );

  const domainsPanel = activeTab === 'domains' && (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-8 min-h-[200px] relative" id="domains-section" role="tabpanel" aria-labelledby="settings-tab-domains">
      {/* Sending Domains Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sending Domains</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Domains used for sending emails</p>
          </div>
          <button
            onClick={() => {
              setShowDomainModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-red hover:bg-custom-red-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-red"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Domain
          </button>
        </div>

        {/* Domains Table */}
        <DomainManagement embedded active={activeTab==='domains'} />
      </div>

      {/* Sites Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sites</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Domains for landing pages and websites</p>
          </div>
          <button
            onClick={() => {
              // Navigate to sites management
              window.location.href = '/sites';
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-red hover:bg-custom-red-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-red"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Site
          </button>
        </div>

        {/* Sites Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Domain</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pages</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  <div className="flex flex-col items-center">
                    <p className="text-sm">No sites configured yet</p>
                    <p className="text-xs text-gray-400 mt-1">Add your first site to get started</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const notificationsPanel = activeTab === 'notifications' && (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-6 min-h-[200px] relative" id="notifications-section" role="tabpanel" aria-labelledby="settings-tab-notifications">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notification Preferences</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Choose how you want to be notified about important updates.</p>
        </div>
      </div>

      <div className="space-y-6">
        <fieldset className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 space-y-4">
          <legend className="px-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Email Notifications</legend>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-red focus:ring-primary-red border-gray-300 rounded"
                defaultChecked
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">Campaign performance reports</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-red focus:ring-primary-red border-gray-300 rounded"
                defaultChecked
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">Account security alerts</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-red focus:ring-primary-red border-gray-300 rounded"
                defaultChecked
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">Domain verification updates</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-primary-red focus:ring-primary-red border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">Marketing tips and updates</span>
            </label>
          </div>
        </fieldset>
      </div>
    </div>
  );

  const accountPanel = activeTab === 'account' && (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-6 min-h-[200px] relative" id="account-section" role="tabpanel" aria-labelledby="settings-tab-account">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Information</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View and manage your account details.</p>
        </div>
      </div>

      <div className="space-y-6">
        <fieldset className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 space-y-4">
          <legend className="px-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Account Details</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoItem label="Email" value={user?.email} />
            <InfoItem label="Role" value={user?.role} />
            <InfoItem label="Status" value={user?.status} />
            <InfoItem label="Verified" value={user?.isVerified ? 'Yes' : 'No'} />
            <InfoItem label="Profile Complete" value={user?.isProfileComplete ? 'Yes' : 'No'} />
            <InfoItem label="Created" value={user?.createdAt && new Date(user.createdAt).toLocaleDateString()} />
            <InfoItem label="Last Login" value={user?.lastLogin && new Date(user.lastLogin).toLocaleString()} />
            <InfoItem label="Two-Factor Auth" value={user?.twoFactorEnabled ? 'Enabled' : 'Disabled'} />
            <InfoItem label="Verified Domain" value={user?.hasVerifiedDomain ? 'Yes' : 'No'} />
            <InfoItem label="API Key" value={user?.apiKeyPresent ? 'Exists' : 'None'} />
            <InfoItem label="API Key Last Used" value={user?.apiKeyLastUsed && new Date(user.apiKeyLastUsed).toLocaleDateString()} />
            <InfoItem label="Deletion Requested" value={user?.deletionRequestedAt ? new Date(user.deletionRequestedAt).toLocaleString() : 'No'} />
          </div>

          {/* Subscription & Limits */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Subscription</h4>
              <div className="text-xs grid grid-cols-2 gap-x-4 gap-y-1">
                <span className="text-gray-500 dark:text-gray-400">Plan:</span><span className="text-gray-900 dark:text-gray-100">{user?.subscription?.plan || '—'}</span>
                <span className="text-gray-500 dark:text-gray-400">Status:</span><span className="text-gray-900 dark:text-gray-100">{user?.subscription?.status || '—'}</span>
                <span className="text-gray-500 dark:text-gray-400">Current Period:</span><span className="text-gray-900 dark:text-gray-100">{ user?.subscription?.currentPeriodStart && user?.subscription?.currentPeriodEnd ? `${new Date(user.subscription.currentPeriodStart).toLocaleDateString()} → ${new Date(user.subscription.currentPeriodEnd).toLocaleDateString()}` : '—' }</span>
                <span className="text-gray-500 dark:text-gray-400">Cancel at End:</span><span className="text-gray-900 dark:text-gray-100">{user?.subscription?.cancelAtPeriodEnd ? 'Yes' : 'No'}</span>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Usage Limits</h4>
              <div className="text-xs grid grid-cols-2 gap-x-4 gap-y-1">
                <span className="text-gray-500 dark:text-gray-400">Emails / Month:</span><span>{user?.usage?.emailsSentThisMonth ?? 0} / {user?.limits?.emailsPerMonth ?? '—'}</span>
                <span className="text-gray-500 dark:text-gray-400">Subscribers:</span><span>{user?.usage?.subscribersCount ?? 0} / {user?.limits?.subscribersMax ?? '—'}</span>
                <span className="text-gray-500 dark:text-gray-400">Templates:</span><span>{user?.usage?.templatesCount ?? 0} / {user?.limits?.templatesMax ?? '—'}</span>
                <span className="text-gray-500 dark:text-gray-400">Campaigns / Month:</span><span>{user?.usage?.campaignsThisMonth ?? 0} / {user?.limits?.campaignsPerMonth ?? '—'}</span>
                <span className="text-gray-500 dark:text-gray-400">Usage Reset:</span><span>{user?.usage?.lastResetDate ? new Date(user.usage.lastResetDate).toLocaleDateString() : '—'}</span>
              </div>
            </div>
          </div>

          {/* Preferences (timezone / date format) */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Preferences</h4>
              <div className="text-xs grid grid-cols-2 gap-x-4 gap-y-1">
                <span className="text-gray-500 dark:text-gray-400">Timezone:</span><span>{user?.preferences?.timezone || 'UTC'}</span>
                <span className="text-gray-500 dark:text-gray-400">Date Format:</span><span>{user?.preferences?.dateFormat || '—'}</span>
                <span className="text-gray-500 dark:text-gray-400">Layout:</span><span>{user?.preferences?.dashboardLayout || '—'}</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Email Notifications</h4>
              <div className="text-xs grid grid-cols-2 gap-x-4 gap-y-1">
                <span className="text-gray-500 dark:text-gray-400">Campaign Updates:</span><span>{user?.preferences?.emailNotifications?.campaignUpdates ? 'On' : 'Off'}</span>
                <span className="text-gray-500 dark:text-gray-400">System Alerts:</span><span>{user?.preferences?.emailNotifications?.systemAlerts ? 'On' : 'Off'}</span>
                <span className="text-gray-500 dark:text-gray-400">Weekly Reports:</span><span>{user?.preferences?.emailNotifications?.weeklyReports ? 'On' : 'Off'}</span>
                <span className="text-gray-500 dark:text-gray-400">Marketing Emails:</span><span>{user?.preferences?.emailNotifications?.marketingEmails ? 'On' : 'Off'}</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">Organization</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">ID: {user?.organization || '—'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">(Future: fetch org details)</p>
            </div>
          </div>
        </fieldset>

        {/* Account Deletion Section */}
        <div className="border border-red-200 dark:border-red-800 rounded-lg p-6 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">Delete Account</h3>
              <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>

              <div className="mt-4 space-y-3">
                <div className="text-sm text-red-700 dark:text-red-300">
                  <strong>What will be deleted:</strong>
                  <ul className="mt-1 ml-4 list-disc space-y-1">
                    <li>All email campaigns and templates</li>
                    <li>All subscriber lists and contact data</li>
                    <li>All analytics and performance data</li>
                    <li>All domain configurations</li>
                    <li>Your account profile and settings</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
                  <div className="flex">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Before you continue</p>
                      <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                        Consider exporting your data first. You can download your campaigns, subscribers, and analytics from the respective sections.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-red-300 text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 rounded-md text-sm font-medium"
                  >
                    Delete Account
                  </button>
                  <a
                    href="/export-data"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded-md text-sm font-medium"
                  >
                    Export Data First
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const aside = null;

  const handleInitiateDeletion = async () => {
    if (!deletePassword.trim()) return;

    setDeletingAccount(true);
    try {
      await userService.initiateAccountDeletion(deletePassword, deleteReason);
      toast.success('Account deletion request sent. Please check your email for confirmation.');
      setShowDeleteModal(false);
      setDeletePassword('');
      setDeleteReason('');
    } catch (error) {
      console.error('Failed to initiate account deletion:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate account deletion');
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleCreateDomain = async () => {
    if (!newDomain.trim()) return;

    setCreatingDomain(true);
    try {
      await createDomain(newDomain.trim());
      toast.success('Domain added successfully! Please verify it to start sending emails.');
      setShowDomainModal(false);
      setNewDomain('');
      // Optionally refresh the domains list
      window.location.reload();
    } catch (error) {
      console.error('Failed to create domain:', error);
      toast.error(error.response?.data?.message || 'Failed to add domain');
    } finally {
      setCreatingDomain(false);
    }
  };

  return (
    <SettingsLayout
      heading="Settings"
      description="Manage your profile and sending domains."
      tabsBar={tabsBar}
      aside={aside}
    >
      {generalPanel}
      {accountPanel}
      {domainsPanel}
      {notificationsPanel}

      {/* Domain Creation Modal */}
      {showDomainModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Add Sending Domain</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Enter the domain you want to use for sending emails. We'll guide you through the verification process.
                      </p>
                    </div>

                    <div className="mt-4">
                      <label htmlFor="domain-input" className="block text-sm font-medium text-gray-700">
                        Domain
                      </label>
                      <input
                        type="text"
                        id="domain-input"
                        value={newDomain}
                        onChange={(e) => setNewDomain(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="example.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleCreateDomain}
                  disabled={creatingDomain || !newDomain.trim()}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingDomain ? 'Adding...' : 'Add Domain'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDomainModal(false);
                    setNewDomain('');
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Deletion Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Account</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        This action cannot be undone. This will permanently delete your account and all associated data.
                      </p>
                    </div>

                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="delete-password" className="block text-sm font-medium text-gray-700">
                          Confirm your password
                        </label>
                        <input
                          type="password"
                          id="delete-password"
                          value={deletePassword}
                          onChange={(e) => setDeletePassword(e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                          placeholder="Enter your password"
                        />
                      </div>

                      <div>
                        <label htmlFor="delete-reason" className="block text-sm font-medium text-gray-700">
                          Reason for leaving (optional)
                        </label>
                        <select
                          id="delete-reason"
                          value={deleteReason}
                          onChange={(e) => setDeleteReason(e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        >
                          <option value="">Select a reason</option>
                          <option value="not-using">Not using the service</option>
                          <option value="found-alternative">Found a better alternative</option>
                          <option value="technical-issues">Technical issues</option>
                          <option value="privacy-concerns">Privacy concerns</option>
                          <option value="cost">Too expensive</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleInitiateDeletion}
                  disabled={deletingAccount || !deletePassword.trim()}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingAccount ? 'Deleting...' : 'Delete Account'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword('');
                    setDeleteReason('');
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SettingsLayout>
  );
}

export default ProfileSettings;
