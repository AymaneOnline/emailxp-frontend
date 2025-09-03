// emailxp/frontend/src/pages/ProfileSettings.js

import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';
import { updateUserData } from '../store/slices/authSlice';
import { toast } from 'react-toastify';

import TopBar from '../components/TopBar';

import {
  ArrowPathIcon,
  XCircleIcon,
  CheckCircleIcon,
  UserCircleIcon,
  CameraIcon,
} from '@heroicons/react/24/outline';

function ProfileSettings() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    companyOrOrganization: '',
    name: '',
    email: '',
    website: '',
    industry: '',
    bio: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);

  const industries = [
    "Technology", "Marketing", "E-commerce", "Education", "Healthcare", "Non-profit", "Other"
  ];

  useEffect(() => {
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
        setFormData({
          companyOrOrganization: profileData.companyOrOrganization || '',
          name: profileData.name || '',
          email: profileData.email || '',
          website: profileData.website || '',
          industry: profileData.industry || '',
          bio: profileData.bio || '',
        });
        setProfilePicture(profileData.profilePicture);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      uploadProfilePicture(file);
    }
  };

  const uploadProfilePicture = async (file) => {
    setUploadingPicture(true);
    try {
      const result = await userService.uploadProfilePicture(file);
      setProfilePicture(result.profilePicture);
      
      // Update user data in Redux store
      dispatch(updateUserData({ profilePicture: result.profilePicture }));
      
      toast.success('Profile picture uploaded successfully!');
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      toast.error(err.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setUploadingPicture(false);
    }
  };

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
      const updatedProfile = await userService.updateUserProfile(formData);

      // Dispatch the Redux action to update the user data in the store.
      // We now explicitly set isProfileComplete to true.
      dispatch(updateUserData({ ...updatedProfile, isProfileComplete: true }));
      toast.success('Profile updated successfully!');

      // THE NEW LOGIC: Check if this was the first time the profile was completed.
      if (wasProfileIncomplete) {
        // If it was, navigate the user to the dashboard.
        navigate('/dashboard');
      } else {
        // If the profile was already complete, just show a success message and stay on the page.
        setSuccessMessage('Profile updated successfully!');
      }

    } catch (err) {
      console.error('Error updating profile:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to update profile.');
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ArrowPathIcon className="h-12 w-12 animate-spin text-primary-red" />
      </div>
    );
  }

  return (
    <>
      <TopBar title="Profile Settings" />
      <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {user.isProfileComplete ? "Profile Settings" : "Complete Your Profile"}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {user.isProfileComplete 
              ? "Update your profile information at any time."
              : "Please fill out your profile information to finish your sign-up."
            }
          </p>
          
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                />
              ) : (
                <UserCircleIcon className="w-24 h-24 text-gray-400" />
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPicture}
                className="absolute -bottom-2 -right-2 bg-primary-red text-white p-2 rounded-full hover:bg-custom-red-hover transition-colors duration-200 disabled:opacity-50"
              >
                {uploadingPicture ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <CameraIcon className="w-4 h-4" />
                )}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <p className="text-sm text-gray-500 text-center">
              Click the camera icon to upload a profile picture
            </p>
          </div>

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

          <form className="space-y-6" onSubmit={handleUpdateProfile}>
            <div>
              <label htmlFor="companyOrOrganization" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Company or Organization
              </label>
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

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Name
              </label>
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Email address
              </label>
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

            {/* NEW FIELDS START HERE */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Website
              </label>
              <div className="mt-1">
                <input
                  type="url"
                  name="website"
                  id="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-red focus:ring-primary-red sm:text-sm p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="https://www.example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Industry
              </label>
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
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                About You
              </label>
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
            {/* NEW FIELDS END HERE */}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-red hover:bg-custom-red-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-red"
                disabled={loading}
              >
                {loading ? (
                  <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  'Update Profile'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default ProfileSettings;
