// emailxp/frontend/src/components/ProfileCompletionModal.js

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { X, ArrowRight } from 'lucide-react';
import userService from '../services/userService';
import { updateUserData } from '../store/slices/authSlice';
import { addNotification } from '../store/slices/uiSlice';
import { track } from '../services/analyticsClient';
import { countries } from '../constants/countries';

export default function ProfileCompletionModal({ isOpen, onClose }) {

  // Local CountryDropdown component to avoid module-scope HMR issues.
  function CountryDropdown({ value, onChange }) {
    const [open, setOpen] = useState(false);
    const [highlighted, setHighlighted] = useState(0);
    const containerRef = React.useRef(null);
    const listRef = React.useRef(null);

    // type-to-search buffer
    const typeBufferRef = React.useRef('');
    const lastTypeAtRef = React.useRef(0);

    useEffect(() => {
      function onDocClick(e) {
        if (!containerRef.current) return;
        if (!containerRef.current.contains(e.target)) setOpen(false);
      }
      document.addEventListener('click', onDocClick);
      return () => document.removeEventListener('click', onDocClick);
    }, []);

    useEffect(() => {
      if (!open) return;
      const el = listRef.current?.children[highlighted];
      if (el) el.scrollIntoView({ block: 'nearest' });
    }, [highlighted, open]);

    const handleType = (char) => {
      const now = Date.now();
      if (now - lastTypeAtRef.current > 700) {
        typeBufferRef.current = char;
      } else {
        typeBufferRef.current += char;
      }
      lastTypeAtRef.current = now;
      const q = typeBufferRef.current.toLowerCase();
      const idx = countries.findIndex(c => c.toLowerCase().startsWith(q));
      if (idx >= 0) setHighlighted(idx);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setOpen(true);
        setHighlighted(h => Math.min(h + 1, countries.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setOpen(true);
        setHighlighted(h => Math.max(h - 1, 0));
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (open) {
          onChange(countries[highlighted]);
          setOpen(false);
        } else {
          setOpen(true);
        }
      } else if (e.key === 'Escape') {
        setOpen(false);
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        // printable character: type-to-search
        handleType(e.key);
      }
    };

    return (
      <div ref={containerRef} className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => { setOpen(o => !o); setHighlighted(countries.findIndex(c => c === value) || 0); }}
          onKeyDown={handleKeyDown}
          className="w-full text-left px-3 py-2 border border-gray-300 rounded-md bg-white"
        >
          {value || 'Select your country'}
        </button>

        {open && (
          <ul
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            className="absolute z-50 mt-1 w-full max-h-[14rem] overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
            onKeyDown={handleKeyDown}
          >
            {countries.map((c, idx) => (
              <li
                key={c}
                role="option"
                aria-selected={value === c}
                onMouseEnter={() => setHighlighted(idx)}
                onClick={() => { onChange(c); setOpen(false); }}
                className={`px-3 py-2 cursor-pointer ${highlighted === idx ? 'bg-gray-100' : ''} ${value === c ? 'font-semibold' : ''}`}
              >
                {c}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyOrOrganization: '',
    name: '',
    email: user?.email || '',
    website: '',
    industry: '',
    bio: '',
    address: '',
    city: '',
    country: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        companyOrOrganization: user.companyOrOrganization || '',
        name: user.name || '',
        email: user.email || '',
        website: user.website || '',
        industry: user.industry || '',
        bio: user.bio || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || '',
      });
    }
  }, [user]);

  const requiredFields = ['companyOrOrganization', 'name', 'industry', 'bio'];
  const isComplete = requiredFields.every(field => formData[field]?.trim());

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (!formData.companyOrOrganization?.trim()) newErrors.companyOrOrganization = 'Organization is required';
    if (!formData.industry?.trim()) newErrors.industry = 'Industry is required';
    if (!formData.bio?.trim()) newErrors.bio = 'Bio is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    console.log('ProfileCompletionModal: handleSubmit invoked', { isComplete, loading });
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Call the correct service method (updateUserProfile) which exists in userService
      const updatedProfile = await userService.updateUserProfile(formData);
      dispatch(updateUserData({ ...updatedProfile, isProfileComplete: true }));

      // Fire analytics
      track('profile.completed', {});

      // Add a UI notification so the bell/topbar reflects the completion
      dispatch(addNotification({
        title: 'Profile completed',
        body: 'You have successfully completed your profile.',
        type: 'success',
      }));

      toast.success('Profile completed successfully!');
      onClose();
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Log mount/unmount and where the portal will attach; keep hooks unconditional but
  // guard logs and side-effects by checking isOpen inside the effect.
  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return;
    const modalRoot = document.getElementById('modal-root') || document.body;
    console.log('ProfileCompletionModal: mounting portal into:', modalRoot === document.body ? 'document.body' : '#modal-root', modalRoot);
    console.log('ProfileCompletionModal: mounted');
    return () => console.log('ProfileCompletionModal: unmounted');
  }, [isOpen]);

  if (!isOpen) {
    console.log('❌ ProfileCompletionModal: not open, returning null');
    return null;
  }

  console.log('✅ ProfileCompletionModal: proceeding to render');

  const modal = (
    <div
      id="profile-completion-modal-root"
      data-debug="profile-completion-modal"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 2147483647, backgroundColor: 'rgba(0,0,0,0.6)', pointerEvents: 'auto' }}
    >
      <div className="bg-white shadow-xl w-full h-screen overflow-y-auto border-0 rounded-none">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
            <p className="text-sm text-gray-600 mt-1">Fill in your details to unlock the full EmailXP experience</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Indicator removed as requested */}

        {/* Form */}
  <form id="profile-completion-form" onSubmit={handleSubmit} className="p-6 space-y-6 pb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Organization */}
            <div>
              <label htmlFor="companyOrOrganization" className="block text-sm font-medium text-gray-700 mb-2">
                Organization <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="companyOrOrganization"
                name="companyOrOrganization"
                value={formData.companyOrOrganization}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red ${
                  errors.companyOrOrganization ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Your company or organization"
              />
              {errors.companyOrOrganization && <p className="text-red-500 text-xs mt-1">{errors.companyOrOrganization}</p>}
            </div>

            {/* Industry */}
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                Industry <span className="text-red-500">*</span>
              </label>
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red ${
                  errors.industry ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select your industry</option>
                <option value="technology">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance">Finance</option>
                <option value="education">Education</option>
                <option value="retail">Retail</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="consulting">Consulting</option>
                <option value="non-profit">Non-profit</option>
                <option value="other">Other</option>
              </select>
              {errors.industry && <p className="text-red-500 text-xs mt-1">{errors.industry}</p>}
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              Bio <span className="text-red-500">*</span>
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red ${
                errors.bio ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Tell us about yourself and your role..."
            />
            {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio}</p>}
          </div>

          {/* Address Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
                placeholder="Street address"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-red"
                placeholder="City"
              />
            </div>
          </div>

          {/* Country */}
          <div className="relative" ref={null}>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            {/* Custom dropdown: opens on click and shows a scrollable list limited to ~7 rows */}
            <CountryDropdown
              value={formData.country}
              onChange={(val) => setFormData(prev => ({ ...prev, country: val }))}
            />
          </div>

          {/* Submit Button (fixed full-width footer) */}
          <div className="fixed bottom-0 left-0 right-0 w-full bg-white border-t border-gray-200 z-[2147483648]">
            <div className="w-full px-6 py-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-3"
                disabled={loading}
              >
                Skip for now
              </button>
              <button
                type="submit"
                onClick={() => {
                  // fallback trigger in case submit doesn't propagate for any reason
                  const form = document.getElementById('profile-completion-form');
                  if (form && typeof form.requestSubmit === 'function') {
                    form.requestSubmit();
                  }
                }}
                disabled={!isComplete || loading}
                className={`px-6 py-2 rounded-md font-medium flex items-center ${
                  isComplete && !loading
                    ? 'bg-primary-red text-white hover:bg-red-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  'Saving...'
                ) : (
                  <>
                    Complete Profile
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  // Choose portal root: prefer the app's `#modal-root` if present, otherwise fallback to document.body
  if (typeof document !== 'undefined') {
    const modalRoot = document.getElementById('modal-root') || document.body;
    return createPortal(modal, modalRoot);
  }

  return null;
}