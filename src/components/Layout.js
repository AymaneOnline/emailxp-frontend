import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

/**
 * The main application layout component.
 * It uses a flexbox container to position a fixed-width sidebar and a
 * flexible, scrollable main content area. This is a standard and robust
 * pattern for dashboard layouts.
 */
function Layout() {
  // Access user data from the Redux store
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Determine if the user has completed the required onboarding steps
  const isOnboardingComplete = user?.isVerified && user?.isProfileComplete;

  // Define paths that are always accessible even during onboarding
  const navigation = [
    '/dashboard',
    '/settings',
  ];

  // Check if the current path is one of the allowed paths during onboarding
  const isCurrentPathAccessibleDuringOnboarding = navigation.some(path =>
    window.location.pathname.startsWith(path)
  );

  // Determine if the main content should be disabled by an overlay
  const shouldDisableContent = !isOnboardingComplete && !isCurrentPathAccessibleDuringOnboarding;

  return (
    // Main container uses flexbox to align children side-by-side.
    // 'h-screen' ensures it fills the viewport height, and 'overflow-hidden' prevents
    // the body from scrolling. The scrolling is managed by the main content area.
    <div className="flex h-screen bg-gray-50 font-['Inter']">
      
      {/* The Sidebar component, which has a fixed width. */}
      <Sidebar />
      
      {/* The main content area. 'flex-1' allows it to grow and fill the remaining space.
          'overflow-y-auto' is applied here to make this specific area scrollable. */}
      <main className="flex-1 p-8 bg-gray-50 relative overflow-y-auto">
        <TopBar />
        <div className="relative">
        
        {/* Onboarding overlay. This is absolutely positioned to cover the main content. */}
        {shouldDisableContent && (
          <div className="absolute inset-0 bg-gray-200 bg-opacity-75 z-20 flex items-center justify-center">
            <div className="text-center p-6 bg-white rounded-lg shadow-xl">
              <h3 className="text-xl font-bold text-dark-gray mb-4">Action Required!</h3>
              <p className="text-gray-700 mb-4">Please complete your account setup to access this feature.</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 bg-primary-red text-white rounded-md shadow-md hover:bg-custom-red-hover transition-colors duration-200 text-base font-medium"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* The Outlet container. We conditionally apply 'pointer-events-none'
            to prevent user interaction when the overlay is active. */}
        <div className={shouldDisableContent ? 'pointer-events-none' : ''}>
          <Outlet /> {/* Renders the current nested route component */}
        </div>
        </div>
      </main>
    </div>
  );
}

export default Layout;
