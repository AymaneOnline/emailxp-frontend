// emailxp/frontend/src/components/OnboardingChecklist.js

import React, { useState } from 'react';
import { useSelector } from 'react-redux'; // Removed useDispatch as it's not directly used here
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../services/authService';
// Removed: import { updateUserData } from '../store/slices/authSlice'; // updateUserData is dispatched in Dashboard.js

import { CheckCircleIcon, ChevronRightIcon, PlayCircleIcon } from '@heroicons/react/20/solid';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

function OnboardingChecklist() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate(); // Keep navigate

  const [isSendingVerification, setIsSendingVerification] = useState(false);

  const handleSendVerificationEmail = async () => {
    setIsSendingVerification(true);
    try {
      const response = await authService.sendVerificationEmail();
      toast.success(response.message);
    } catch (error) {
      console.error('Error sending verification email:', error);
      toast.error(error.response?.data?.message || 'Failed to send verification email.');
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleCompleteProfileClick = () => {
    navigate('/settings');
  };

  // Helper to render a step item
  const renderStep = (stepNumber, title, description, isDone, isActive, actionElement = null) => (
    <li
      key={stepNumber}
      className={`relative flex items-center py-4 px-6 rounded-lg shadow-sm border
        ${isDone ? 'bg-green-50 border-green-200' : isActive ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}
        ${!isActive && !isDone ? 'opacity-70' : ''}`}
    >
      <div className="flex items-center">
        {isDone ? (
          <CheckCircleIcon className="h-8 w-8 text-green-500" aria-hidden="true" />
        ) : (
          <PlayCircleIcon className="h-8 w-8 text-blue-500" aria-hidden="true" />
        )}
        <span className={`ml-4 text-xl font-semibold ${isDone ? 'text-green-700' : 'text-gray-800'}`}>
          {stepNumber}
        </span>
      </div>
      <div className="min-w-0 flex-1 pl-4">
        <div className="text-lg font-medium text-gray-900">{title}</div>
        <div className="text-sm text-gray-600">{description}</div>
      </div>
      <div className="flex-shrink-0 ml-4">
        {actionElement}
      </div>
    </li>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <h2 className="text-2xl font-semibold text-dark-gray mb-6">Welcome to EmailXP!</h2>
      <p className="text-gray-700 mb-6">
        You're just a step away from starting to build your campaigns, automations, forms, and more!
        To begin, please finish the last item on the checklist below.
      </p>

      {/* Removed role="list" as it's redundant for <ul> */}
      <ul className="space-y-6">
        {renderStep(
          1,
          'Signing up to EmailXP',
          user?.companyOrOrganization ? `Account created for ${user.companyOrOrganization}` : 'Account created.',
          true,
          false,
          <span className="text-sm font-semibold text-green-600 flex items-center">
            Done <ChevronRightIcon className="h-5 w-5 ml-1" />
          </span>
        )}

        {renderStep(
          2,
          'Email Verification',
          'Verify your email address to activate your account.',
          user?.isVerified,
          !user?.isVerified,
          user?.isVerified ? (
            <span className="text-sm font-semibold text-green-600 flex items-center">
              Verified <CheckCircleIcon className="h-5 w-5 ml-1" />
            </span>
          ) : (
            <button
              type="button"
              onClick={handleSendVerificationEmail}
              disabled={isSendingVerification}
              className={`inline-flex items-center text-sm font-semibold text-primary-red hover:text-custom-red-hover transition-colors duration-200
                ${isSendingVerification ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {isSendingVerification ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  Verify <ChevronRightIcon className="h-5 w-5 ml-1" />
                </>
              )}
            </button>
          )
        )}

        {renderStep(
          3,
          'Complete profile',
          'Complete or update your information manually or integrate your EmailXP account to get started.',
          user?.isProfileComplete,
          user?.isVerified && !user?.isProfileComplete,
          user?.isProfileComplete ? (
            <span className="text-sm font-semibold text-green-600 flex items-center">
              Done <ChevronRightIcon className="h-5 w-5 ml-1" />
            </span>
          ) : (
            <button
              type="button"
              onClick={handleCompleteProfileClick}
              disabled={!user?.isVerified}
              className={`inline-flex items-center text-sm font-semibold text-primary-red hover:text-custom-red-hover transition-colors duration-200
                ${!user?.isVerified ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              Complete <ChevronRightIcon className="h-5 w-5 ml-1" />
            </button>
          )
        )}
      </ul>
    </div>
  );
}

export default OnboardingChecklist;
