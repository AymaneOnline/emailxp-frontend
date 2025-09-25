// emailxp/frontend/src/pages/ConfirmAccountDeletion.js

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import userService from '../services/userService';
import PageContainer from '../components/layout/PageContainer';

export default function ConfirmAccountDeletion() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid confirmation link');
    }
  }, [token]);

  const handleConfirmDeletion = async () => {
    if (!token) return;

    setConfirming(true);
    setError(null);

    try {
      await userService.confirmAccountDeletion(token);
      setConfirmed(true);
      toast.success('Your account has been permanently deleted');

      // Redirect to login after a delay
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (error) {
      console.error('Failed to confirm account deletion:', error);
      setError(error.response?.data?.message || 'Failed to delete account. The link may have expired.');
      toast.error('Failed to delete account');
    } finally {
      setConfirming(false);
    }
  };

  if (confirmed) {
    return (
      <PageContainer>
        <div className="max-w-md mx-auto mt-16">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-900 mb-2">Account Deleted</h2>
            <p className="text-green-700 mb-4">
              Your account and all associated data have been permanently deleted.
            </p>
            <p className="text-sm text-green-600">
              You will be redirected to the login page in a few seconds...
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-md mx-auto mt-16">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Confirm Account Deletion</h1>
            <p className="text-gray-600 mt-2">
              Are you sure you want to permanently delete your account? This action cannot be undone.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm font-medium text-yellow-800">Final Warning</p>
                  <p className="mt-1 text-sm text-yellow-700">
                    This will permanently delete your account and all associated data including campaigns, subscribers, and analytics.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleConfirmDeletion}
                disabled={confirming || !!error}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {confirming ? 'Deleting Account...' : 'Yes, Delete My Account'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/settings#account')}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}