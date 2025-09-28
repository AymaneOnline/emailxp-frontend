// emailxp/frontend/src/App.js

import React, { useEffect, useRef } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyAuth } from './store/slices/authSlice';

// Import your pages/components
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardNew from './pages/DashboardNew';
import RequireOnboardingComplete from './components/RequireOnboardingComplete';
import CampaignManagement from './pages/CampaignManagement';
// CampaignForm removed - using CampaignWizard for both create and edit
import CampaignDetails from './pages/CampaignDetails';
import CampaignWizard from './pages/CampaignWizard';
import SubscriberManagement from './pages/SubscriberManagement';
import SubscriberDetails from './pages/SubscriberDetails';
import SubscriberForm from './pages/SubscriberForm';

import TemplateManagement from './pages/TemplateManagement';
import TemplateForm from './pages/TemplateForm';
import TemplatePreview from './pages/TemplatePreview';
import SubscriberImport from './pages/SubscriberImport';
import ErrorBoundary from './components/ErrorBoundary';
import ProfileSettings from './pages/ProfileSettings';
import GroupForm from './pages/GroupForm';
import GroupManagement from './pages/GroupManagement';
import SubscribersForGroup from './pages/SubscribersForGroup';
import LandingPage from './pages/LandingPage';
// Removed standalone RecommendationsManager import (will integrate into subscriber UI)
import AutomationBuilderPage from './pages/AutomationBuilderPage';
import AutomationManagement from './pages/AutomationManagement';
import FileManagement from './pages/FileManagement';
// import AnalyticsDashboard from './pages/AnalyticsDashboard'; // Removed this import
// Sites and Forms pages removed from main navigation
// Removed standalone ABTesting page import (A/B tests integrated into Campaigns)
import PublicLandingPage from './pages/PublicLandingPage'; // Add this import
import VerifyEmail from './pages/VerifyEmail';

// Import the Layout component
import Layout from './components/Layout';
import { startGlobalLoading } from './hooks/useGlobalLoading';

// Define your routes
const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    // The backend will handle redirection after successful verification,
    // so this route is only for initial registration.
    element: <Register />,
  },
  {
    path: '/verify-email',
    element: <VerifyEmail />,
  },
  {
    path: '/dashboard',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <DashboardNew />,
      },
    ],
  },
  // Removed the analytics route
  // {
  //   path: '/analytics',
  //   element: <Layout />,
  //   children: [
  //     {
  //       path: '',
  //       element: <AnalyticsDashboard />,
  //     },
  //   ],
  // },
  {
    path: '/campaigns',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
  { index: true, element: <RequireOnboardingComplete><CampaignManagement /></RequireOnboardingComplete> },
  { path: 'new', element: <RequireOnboardingComplete><CampaignWizard /></RequireOnboardingComplete> },
  { path: 'edit/:id', element: <RequireOnboardingComplete><CampaignWizard /></RequireOnboardingComplete> },
    ],
  },
  {
    path: '/campaigns/details/:id',
    element: <Layout />,
    children: [
      {
        path: '',
  element: <RequireOnboardingComplete><CampaignDetails /></RequireOnboardingComplete>,
      },
    ],
  },
  {
    path: '/subscribers',
    element: <Layout />,
    children: [
      {
        path: '',
  element: <RequireOnboardingComplete><SubscriberManagement /></RequireOnboardingComplete>,
      },
      {
        path: ':id',
        element: <RequireOnboardingComplete><SubscriberDetails /></RequireOnboardingComplete>
      }
    ],
  },
  {
    path: '/subscribers/new',
    element: <Layout />,
    children: [
      {
        path: '',
  element: <RequireOnboardingComplete><SubscriberForm /></RequireOnboardingComplete>,
      },
    ],
  },
  {
    path: '/subscribers/edit/:id',
    element: <Layout />,
    children: [
      {
        path: '',
  element: <RequireOnboardingComplete><SubscriberForm /></RequireOnboardingComplete>,
      },
    ],
  },
  {
    path: '/subscribers/import',
    element: <Layout />,
    children: [
      {
        path: '',
  element: <RequireOnboardingComplete><SubscriberImport /></RequireOnboardingComplete>,
      },
    ],
  },

  {
    path: '/templates',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
  { index: true, element: <RequireOnboardingComplete><TemplateManagement /></RequireOnboardingComplete> },
  { path: 'new', element: <RequireOnboardingComplete><TemplateForm /></RequireOnboardingComplete> },
  { path: 'edit/:id', element: <RequireOnboardingComplete><TemplateForm /></RequireOnboardingComplete> },
  { path: 'preview/:id', element: <RequireOnboardingComplete><TemplatePreview /></RequireOnboardingComplete> },
    ],
  },
  {
    path: '/groups/new',
    element: <Layout />,
    children: [
      {
        path: '',
  element: <RequireOnboardingComplete><GroupForm /></RequireOnboardingComplete>,
      },
    ],
  },
  {
    path: '/groups',
    element: <Layout />,
    children: [
      {
        path: '',
  element: <RequireOnboardingComplete><GroupManagement /></RequireOnboardingComplete>,
      },
    ],
  },
  {
    path: '/groups/new',
    element: <Layout />,
    children: [
      {
        path: '',
  element: <RequireOnboardingComplete><GroupForm /></RequireOnboardingComplete>,
      },
    ],
  },
  {
    path: '/groups/edit/:id',
    element: <Layout />,
    children: [
      {
        path: '',
  element: <RequireOnboardingComplete><GroupForm /></RequireOnboardingComplete>,
      },
    ],
  },
  {
    path: '/groups/:groupId/subscribers',
    element: <Layout />,
    children: [
      {
        path: '',
  element: <RequireOnboardingComplete><SubscribersForGroup /></RequireOnboardingComplete>,
      },
    ],
  },
  {
    path: '/settings',
    element: <Layout />,
    children: [
      { index: true, element: <RequireOnboardingComplete><ProfileSettings /></RequireOnboardingComplete> },
    ],
  },
  // Forms and Sites routes removed from the main app routes. Access to these pages is deprecated.
  {
    path: '/automation',
    element: <Layout />,
    children: [
      {
        path: '',
  element: <RequireOnboardingComplete><AutomationManagement /></RequireOnboardingComplete>,
      },
      { path: 'new', element: <RequireOnboardingComplete><AutomationBuilderPage /></RequireOnboardingComplete> },
      { path: 'edit/:id', element: <RequireOnboardingComplete><AutomationBuilderPage /></RequireOnboardingComplete> },
    ],
  },
  {
    path: '/files',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <RequireOnboardingComplete><FileManagement /></RequireOnboardingComplete>,
      },
    ],
  },
  {
    path: '/integrations',
    element: <Layout />,
    children: [
      {
        path: '',
  element: <RequireOnboardingComplete><div>Integrations Page Content</div></RequireOnboardingComplete>,
      },
    ],
  },
  // Standalone routes for behavioral triggers, recommendations, and A/B testing removed; features embedded in parent sections
  {
    path: '/upgrade-plan',
    element: <Layout />,
    children: [
      {
        path: '',
  element: <RequireOnboardingComplete><div>Upgrade Plan Page Content</div></RequireOnboardingComplete>,
      },
    ],
  },
  {
    path: '/landing/:slug',
    element: <PublicLandingPage />,
  },
]);

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const didVerifyRef = useRef(false);
  useEffect(() => {
    const storedToken = (() => {
      try {
        return JSON.parse(localStorage.getItem('user'))?.token;
      } catch {
        return null;
      }
    })();
    const token = user?.token || storedToken;
    if (token && !didVerifyRef.current) {
      didVerifyRef.current = true;
      dispatch(verifyAuth());
    }
  }, [dispatch, user?.token]);

  // Basic route change listener: since createBrowserRouter does not expose direct events here,
  // we can optimistically start loading on navigation link clicks via capturing clicks on anchor tags.
  // (Future enhancement: migrate to data routers useNavigation hook in a Layout wrapper.)
  React.useEffect(() => {
    const handler = (e) => {
      const anchor = e.target.closest('a');
      if (anchor && anchor.href && anchor.target !== '_blank' && anchor.origin === window.location.origin) {
        const end = startGlobalLoading();
        // Heuristic: stop after next paint + small delay; real data routers would tie to loader completion.
        requestAnimationFrame(() => {
          setTimeout(() => end(), 600);
        });
      }
    };
    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, []);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;