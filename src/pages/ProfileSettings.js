// emailxp/frontend/src/pages/ProfileSettings.js

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import { updateUserData } from '../store/slices/authSlice';
import { toast } from 'react-toastify';
import { track } from '../services/analyticsClient';
import { normalizeWebsiteFrontend } from '../utils/website';
import api from '../services/api';
import { countries } from '../constants/countries';


import {
  ArrowPathIcon,
  XCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import DomainManagement from './DomainManagement';
import SettingsLayout from '../components/layout/SettingsLayout';

function ProfileSettings() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
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

  const industries = [
    "Technology", "Marketing", "E-commerce", "Education", "Healthcare", "Non-profit", "Other"
  ];

  // Tab state synced with hash (#profile | #domains | #account) – must be before any early returns
  const getInitialTab = () => {
    if (typeof window === 'undefined') return 'profile';
    if (window.location.hash === '#domains') return 'domains';
    if (window.location.hash === '#account') return 'account';
    return 'profile';
  };
  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [domainsLoaded, setDomainsLoaded] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const onHashChange = () => {
        if (window.location.hash === '#domains') setActiveTab('domains');
        else if (window.location.hash === '#account') setActiveTab('account');
        else setActiveTab('profile');
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
    }
  }, []);
  const switchTab = useCallback((tab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const targetHash = tab === 'domains' ? '#domains' : tab === 'account' ? '#account' : '#profile';
      if (window.location.hash !== targetHash) {
        window.history.replaceState({}, '', targetHash);
      }
      // Maintain current scroll position; only move focus (no scrolling)
      requestAnimationFrame(() => {
        const id = tab === 'domains' ? 'domains-section' : tab === 'account' ? 'account-section' : 'profile-section';
        const el = document.getElementById(id);
        if (el) {
          try { el.focus({ preventScroll: true }); } catch { el.focus?.(); }
        }
      });
    }
  }, []);

  useEffect(() => {
    // Handle verification success toast
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('verified') === 'true') {
        toast.success('Email verified successfully!');
        url.searchParams.delete('verified');
        window.history.replaceState({}, '', url.toString());
      }
    }

    // If the user is not logged in, navigate to the login page.
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        const profileData = await userService.getUserProfile();
        let initialWebsite = profileData.website || '';
        if (!initialWebsite) {
          try {
            const orgResp = await api.get('/organizations/current');
            if (orgResp.data?.website) {
              initialWebsite = orgResp.data.website;
            }
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
  // Avatar removed – ignore profilePicture
      } catch (err) {
        console.error('Error fetching profile:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };
    
    // Fetch the profile data when the component loads.
    fetchProfile();
    
  }, [user, navigate]);

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
      <div className="flex justify-center items-center h-screen">
        <ArrowPathIcon className="h-12 w-12 animate-spin text-primary-red" />
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
        const order=['profile','domains','account'];
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
      <button id="settings-tab-profile" role="tab" aria-selected={activeTab==='profile'} aria-controls="profile-section" tabIndex={activeTab==='profile'?0:-1} onClick={()=>switchTab('profile')} className={(activeTab==='profile' ? 'bg-primary-red text-white ' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 ') + 'px-3 py-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-red'}>Profile</button>
      <button id="settings-tab-domains" role="tab" aria-selected={activeTab==='domains'} aria-controls="domains-section" tabIndex={activeTab==='domains'?0:-1} onClick={()=>switchTab('domains')} className={(activeTab==='domains' ? 'bg-primary-red text-white ' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 ') + 'px-3 py-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-red'}>Domains</button>
      <button id="settings-tab-account" role="tab" aria-selected={activeTab==='account'} aria-controls="account-section" tabIndex={activeTab==='account'?0:-1} onClick={()=>switchTab('account')} className={(activeTab==='account' ? 'bg-primary-red text-white ' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 ') + 'px-3 py-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-red'}>Account</button>
    </div>
  );

  const profilePanel = activeTab === 'profile' && (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-6 relative" id="profile-section" role="tabpanel" aria-labelledby="settings-tab-profile">
            <div className="flex items-start justify-between">
              <div>
                <h2
                  id="profile-settings-heading"
                  ref={pageHeadingRef}
                  className="text-2xl font-bold text-gray-900 dark:text-white"
                >
                  {user.isProfileComplete ? 'Profile Settings' : 'Complete Your Profile'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {user.isProfileComplete
                    ? 'Update your profile information at any time.'
                    : 'Fill out your profile to finish signup and unlock the full dashboard.'}
                </p>
              </div>
            </div>
            {/* Completion banner removed: immediate redirect now occurs upon first completion */}

            <div className="space-y-4" aria-live="polite">
              {error && (
                <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">
                  <div className="flex items-center">
                    <XCircleIcon className="h-5 w-5 mr-2" />
                    <span className="block sm:inline">{error}</span>
                  </div>
                </div>
              )}
              {successMessage && (
                <div className="bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-300 px-4 py-3 rounded relative" role="alert">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    <span className="block sm:inline">{successMessage}</span>
                  </div>
                </div>
              )}
            </div>
            <form className="space-y-8" onSubmit={handleUpdateProfile} noValidate>
              {/* Identity Section */}
              <fieldset className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 space-y-6">
                <legend className="px-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Identity</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Name</label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-red focus:ring-primary-red sm:text-sm p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Email address</label>
                    <div className="mt-1">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-red focus:ring-primary-red sm:text-sm p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* Organization Section */}
              <fieldset className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 space-y-6">
                <legend className="px-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Organization</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-1">
                    <label htmlFor="companyOrOrganization" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Company or Organization</label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="companyOrOrganization"
                        id="companyOrOrganization"
                        value={formData.companyOrOrganization}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-red focus:ring-primary-red sm:text-sm p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                      />
                    </div>
                  </div>
                  <div className="md:col-span-1">
                    <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Industry</label>
                    <div className="mt-1">
                      <select
                        id="industry"
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-red focus:border-primary-red sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="">Select an industry</option>
                        {industries.map((industry) => (
                          <option key={industry} value={industry}>{industry}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Website</label>
                    <div className="mt-1">
                      <input
                        type="url"
                        name="website"
                        id="website"
                        value={websiteInput}
                        onChange={handleChange}
                        onBlur={handleWebsiteBlur}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-red focus:ring-primary-red sm:text-sm p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="https://www.example.com"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">We will normalize (force https, lowercase domain, strip tracking parameters).</p>
                    {websitePreview && !websiteError && websitePreview !== websiteInput && (
                      <p className="mt-1 text-xs text-blue-600 dark:text-blue-300">Will save as: {websitePreview}</p>
                    )}
                    {websiteError && (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">{websiteError}</p>
                    )}
                  </div>
                </div>
              </fieldset>

              {/* Location Section */}
              <fieldset className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 space-y-6">
                <legend className="px-2 text-sm font-semibold text-gray-800 dark:text-gray-200">Location</legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-3">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Address</label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="address"
                        id="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-red focus:ring-primary-red sm:text-sm p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="123 Main St"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-3">
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-200">City</label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="city"
                        id="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-red focus:ring-primary-red sm:text-sm p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="San Francisco"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-3">
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Country</label>
                    <div className="mt-1">
                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-red focus:border-primary-red sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="">Select a country</option>
                        {countries.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* About Section */}
              <fieldset className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 space-y-4">
                <legend className="px-2 text-sm font-semibold text-gray-800 dark:text-gray-200">About</legend>
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-200">About You</label>
                  <div className="mt-1">
                    <textarea
                      id="bio"
                      name="bio"
                      rows="3"
                      value={formData.bio}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-primary-red focus:border-primary-red mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Tell us a little about your work and goals..."
                    ></textarea>
                  </div>
                </div>
              </fieldset>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <button
                  type="submit"
                  className={`flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isDirty && !loading && !websiteError ? 'bg-primary-red hover:bg-custom-red-hover' : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-red disabled:opacity-70`}
                  disabled={loading || !isDirty || !!websiteError}
                  aria-disabled={loading || !isDirty || !!websiteError}
                >
                  {loading ? (
                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                  ) : (
                    isDirty ? 'Save Changes' : 'No Changes'
                  )}
                </button>
                <div className="min-w-[140px] text-xs text-left" aria-live="polite">
                  {isDirty && !loading && (
                    <span className="inline-flex items-center text-amber-600 dark:text-amber-400">Unsaved changes…</span>
                  )}
                  {!isDirty && justSaved && !loading && (
                    <span className="inline-flex items-center text-green-600 dark:text-green-400">
                      <CheckCircleIcon className="h-4 w-4 mr-1" /> Saved
                    </span>
                  )}
                  {!isDirty && !justSaved && !loading && (
                    <span className="text-gray-500 dark:text-gray-400">All changes saved</span>
                  )}
                </div>
              </div>
            </form>
          </div>
  );

  const domainsPanel = activeTab === 'domains' && (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-6 min-h-[200px] relative" id="domains-section" role="tabpanel" aria-labelledby="settings-tab-domains">
      {!domainsLoaded && (
        <div className="space-y-4 animate-pulse" aria-hidden="true">
          <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="flex gap-3 pt-2">
            <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      )}
      <DomainManagement embedded active={activeTab==='domains'} onLoaded={() => setDomainsLoaded(true)} />
    </div>
  );

  const accountPanel = activeTab === 'account' && (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-6 min-h-[200px] relative" id="account-section" role="tabpanel" aria-labelledby="settings-tab-account">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Management</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account settings and data.</p>
        </div>
      </div>

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
  );

  const aside = (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-5 space-y-4" aria-label="Profile completion progress">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">Profile Progress</h3>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{progressPct}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-red transition-all duration-300"
                style={{ width: `${progressPct}%` }}
                aria-hidden="true"
              />
            </div>
            <ul className="space-y-2">
              {checklist.map(item => (
                <li key={item.key} className="flex items-center text-sm">
                  {item.done ? (
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                  ) : (
                    <span className="h-4 w-4 mr-2 rounded-full border border-gray-300 dark:border-gray-600 inline-block" aria-hidden="true" />
                  )}
                  <span className={item.done ? 'text-gray-600 dark:text-gray-300 line-through' : 'text-gray-800 dark:text-gray-200'}>{item.label}</span>
                </li>
              ))}
            </ul>
          <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">A complete profile personalizes recommendations and unlocks advanced analytics sooner.</p>
          </div>
    </div>
  );

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

  return (
    <SettingsLayout
      heading="Settings"
      description="Manage your profile and sending domains."
      tabsBar={tabsBar}
      aside={aside}
    >
      {profilePanel}
      {domainsPanel}
      {accountPanel}

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
