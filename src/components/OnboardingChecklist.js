// emailxp/frontend/src/components/OnboardingChecklist.js

import React, { useState, useEffect, useRef } from 'react';
import useReducedMotion from '../hooks/useReducedMotion';
import devLog from '../utils/devLog';
import { useSelector } from 'react-redux'; // Removed useDispatch as it's not directly used here
import { toast } from 'react-toastify';
import authService from '../services/authService';
// Removed: import { updateUserData } from '../store/slices/authSlice'; // updateUserData is dispatched in Dashboard.js

import { CheckCircleIcon, ChevronRightIcon, PlayCircleIcon } from '@heroicons/react/20/solid';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { track } from '../services/analyticsClient';

function OnboardingChecklist({ compact = false, showProfileModal, setShowProfileModal }) {
  const { user } = useSelector((state) => state.auth);

  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [sandboxNotice, setSandboxNotice] = useState(false);
  const [cooldownEndsAt, setCooldownEndsAt] = useState(() => {
    const stored = localStorage.getItem('verifyEmailCooldown');
    return stored ? parseInt(stored, 10) : 0;
  });
  const [now, setNow] = useState(Date.now());
  const progressLiveRef = useRef(null);
  const activeStepHeadingRef = useRef(null);
  const previousCompletionRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  // render

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Analytics & focus handling
  useEffect(() => {
    const doneStates = { verified: !!user?.isVerified, profile: !!user?.isProfileComplete };
    const completedCount = [true, doneStates.verified, doneStates.profile].filter(Boolean).length;
    if (previousCompletionRef.current !== completedCount) {
      track('onboarding_progress_change', { completed: completedCount, total: 3 });
      if (completedCount === 3) track('onboarding_complete');
      previousCompletionRef.current = completedCount;
    }
    if (activeStepHeadingRef.current) {
      activeStepHeadingRef.current.focus({ preventScroll: true });
    }
  }, [user?.isVerified, user?.isProfileComplete]);

  const remainingMs = Math.max(0, cooldownEndsAt - now);
  const remainingSec = Math.ceil(remainingMs / 1000);
  const inCooldown = remainingMs > 0;

  const handleSendVerificationEmail = async () => {
    if (inCooldown) return;
    setIsSendingVerification(true);
    try {
      const response = await authService.sendVerificationEmail();
      if (response?.sandbox) {
        setSandboxNotice(true);
        toast.info(response.message || 'Domain not verified – email not sent.');
      } else {
        toast.success(response.message || 'Verification email sent.');
      }
      const ends = Date.now() + 60000; // 60s cooldown
      setCooldownEndsAt(ends);
      localStorage.setItem('verifyEmailCooldown', ends.toString());
    } catch (error) {
      devLog('Error sending verification email:', error);
      toast.error(error.response?.data?.message || 'Failed to send verification email.');
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleCompleteProfileClick = () => {
  devLog('Complete button clicked, opening modal');
    // Open full-screen profile completion modal
    setShowProfileModal(true);
  devLog('setShowProfileModal called with true');
  };

  // Helper to render a step item
  const renderStep = (stepNumber, title, description, isDone, isActive, actionElement = null, headingRef = null) => (
    <li
      key={stepNumber}
  className={`relative flex items-center ${compact ? 'py-3 px-4' : 'py-4 px-6'} rounded-lg border ${prefersReducedMotion ? '' : 'transition-colors'} focus-within:ring-2 focus-within:ring-primary-red outline-none`
        + ` ${isDone ? 'bg-green-50 border-green-200' : isActive ? 'bg-white border-primary-red/40 ring-1 ring-primary-red/30' : 'bg-gray-50 border-gray-200'}`
        + ` ${!isActive && !isDone ? 'opacity-70' : ''}`}
    >
      <div className="flex items-center">
        {isDone ? (
          <CheckCircleIcon className={`${compact ? 'h-6 w-6' : 'h-8 w-8'} text-green-500`} aria-hidden="true" />
        ) : (
          <PlayCircleIcon className={`${compact ? 'h-6 w-6' : 'h-8 w-8'} text-primary-red`} aria-hidden="true" />
        )}
        <span className={`ml-3 ${compact ? 'text-lg' : 'text-xl'} font-semibold ${isDone ? 'text-green-700' : 'text-gray-800'}`}>
          {stepNumber}
        </span>
      </div>
      <div className="min-w-0 flex-1 pl-4">
        <div
          ref={headingRef}
          tabIndex={isActive ? 0 : -1}
          className={`${compact ? 'text-base' : 'text-lg'} font-medium text-gray-900`}
          aria-live={isActive ? 'polite' : undefined}
        >{title}</div>
        <div className={`${compact ? 'text-xs' : 'text-sm'} text-gray-600`}>{description}</div>
      </div>
      <div className="flex-shrink-0 ml-4">
        {actionElement}
      </div>
    </li>
  );

  return (
  <div className={`bg-white ${compact ? 'p-5' : 'p-6'} rounded-xl shadow-md border border-gray-200`}>
      {/* Progress Indicator */}
      {(() => {
  const total = 3;
  const done = [true, !!user?.isVerified, !!user?.isProfileComplete].filter(Boolean).length;
        const percentage = (done / total) * 100;
        return (
          <div className="mb-5" aria-live="polite" ref={progressLiveRef}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600 tracking-wide uppercase">Progress</span>
              <span className="text-xs text-gray-500">{done}/{total}</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percentage)}>
              <div
                className="h-full bg-primary-red transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })()}
      {sandboxNotice && (
        <div className="mb-4 p-4 rounded-md border border-yellow-300 bg-yellow-50 text-sm text-yellow-800">
          Domain not verified yet – emails to external recipients are blocked. Add DKIM/SPF records & verify in your email provider.
        </div>
      )}
      {!compact && (
        <>
          <h2 className="text-2xl font-semibold text-dark-gray mb-6">Welcome to EmailXP!</h2>
          <p className="text-gray-700 mb-6">
            You're just a step away from starting to build your campaigns, automations, forms, and more!
            To begin, please finish the last item on the checklist below.
          </p>
        </>
      )}

      {/* Removed role="list" as it's redundant for <ul> */}
  <ul className={`${compact ? 'space-y-4' : 'space-y-6'}`}>
        {renderStep(
          1,
          'Account Created',
          user?.companyOrOrganization ? `Created for ${user.companyOrOrganization}` : 'Your account is ready.',
          true,
          false,
          <span className="text-sm font-semibold text-green-600 flex items-center">
            Done <ChevronRightIcon className="h-5 w-5 ml-1" />
          </span>
        )}

        {renderStep(
          2,
          'Verify Email',
          'Confirm your address to unlock the platform.',
          user?.isVerified,
          !user?.isVerified,
          user?.isVerified ? (
            <span className="text-sm font-semibold text-green-600 flex items-center">
              Verified <CheckCircleIcon className="h-5 w-5 ml-1" />
            </span>
          ) : (
            <div className="flex flex-col items-end">
              <button
                type="button"
                onClick={handleSendVerificationEmail}
                disabled={isSendingVerification || inCooldown}
                className={`inline-flex items-center rounded-md text-sm font-medium px-4 py-2 shadow-sm border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-red
                  ${(isSendingVerification || inCooldown)
                    ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-primary-red border-primary-red text-white hover:bg-custom-red-hover'}
                `}
                aria-disabled={isSendingVerification || inCooldown}
              >
                {isSendingVerification ? (
                  <>
                    <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                    Sending...
                  </>
                ) : inCooldown ? (
                  <>Retry in {remainingSec}s</>
                ) : (
                  <>Verify <ChevronRightIcon className="h-5 w-5 ml-1" /></>
                )}
              </button>
              {inCooldown && (
                <div className="mt-2 w-40" aria-live="off">
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={60} aria-valuenow={remainingSec} aria-label="Resend cooldown">
                    <div className={`h-full bg-primary-red/70 ${prefersReducedMotion ? '' : 'transition-all duration-1000'}`} style={{ width: `${((60 - remainingSec) / 60) * 100}%` }} />
                  </div>
                </div>
              )}
            </div>
          )
        )}

        {renderStep(
          3,
          'Complete Profile',
          'Finish details so we can personalize sending.',
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
              className={`inline-flex items-center rounded-md text-sm font-medium px-4 py-2 border shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-red
                ${!user?.isVerified
                  ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}
              `}
            >
              Complete <ChevronRightIcon className="h-5 w-5 ml-1" />
            </button>
          )
        )}
      </ul>
    </div>
  );

  // Render complete UI above; duplicate compact render removed to fix unreachable code warning
}

export default OnboardingChecklist;
