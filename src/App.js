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
import EnhancedDashboard from './pages/EnhancedDashboard';
import CampaignManagement from './pages/CampaignManagement';
import EnhancedCampaignManagement from './pages/EnhancedCampaignManagement';
// CampaignForm removed - using CampaignWizard for both create and edit
import CampaignDetails from './pages/CampaignDetails';
import CampaignWizard from './pages/CampaignWizard';
import EnhancedCampaignWizard from './pages/EnhancedCampaignWizard';
import SubscriberManagement from './pages/SubscriberManagement';
import SubscriberForm from './pages/SubscriberForm';

import TemplateManagement from './pages/TemplateManagement';
import TemplateEditor from './pages/TemplateEditor';
import TemplatePreview from './pages/TemplatePreview';
import SubscriberImport from './pages/SubscriberImport';
import TestDragDrop from './components/TestDragDrop';
import DebugTemplate from './components/DebugTemplate';
import ErrorBoundary from './components/ErrorBoundary';
import TestTemplatePreview from './pages/TestTemplatePreview';
import ProfileSettings from './pages/ProfileSettings';
import GroupForm from './pages/GroupForm';
import GroupManagement from './pages/GroupManagement';
import SubscribersForGroup from './pages/SubscribersForGroup';
import LandingPage from './pages/LandingPage';

// Import the Layout component
import Layout from './components/Layout';

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
    path: '/dashboard',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <EnhancedDashboard />,
      },
    ],
  },
  {
    path: '/campaigns',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <EnhancedCampaignManagement /> },
      { path: 'new', element: <EnhancedCampaignWizard /> },
      { path: 'edit/:id', element: <EnhancedCampaignWizard /> },
    ],
  },
  {
    path: '/campaigns/details/:id',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <CampaignDetails />,
      },
    ],
  },
  {
    path: '/subscribers',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <SubscriberManagement />,
      },
    ],
  },
  {
    path: '/subscribers/new',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <SubscriberForm />,
      },
    ],
  },
  {
    path: '/subscribers/edit/:id',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <SubscriberForm />,
      },
    ],
  },
  {
    path: '/subscribers/import',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <SubscriberImport />,
      },
    ],
  },

  {
    path: '/templates',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <TemplateManagement /> },
      { path: 'new', element: <TemplateEditor /> },
      { path: 'edit/:id', element: <TemplateEditor /> },
      { path: 'preview/:id', element: <TemplatePreview /> },
    ],
  },
  {
    path: '/groups/new',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <GroupForm />,
      },
    ],
  },
  {
    path: '/groups',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <GroupManagement />,
      },
    ],
  },
  {
    path: '/groups/new',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <GroupForm />,
      },
    ],
  },
  {
    path: '/groups/edit/:id',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <GroupForm />,
      },
    ],
  },
  {
    path: '/groups/:groupId/subscribers',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <SubscribersForGroup />,
      },
    ],
  },
  {
    path: '/settings',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <ProfileSettings />,
      },
    ],
  },
  {
    path: '/forms',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <div>Forms Page Content</div>,
      },
    ],
  },
  {
    path: '/sites',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <div>Sites Page Content</div>,
      },
    ],
  },
  {
    path: '/automation',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <div>Automation Page Content</div>,
      },
    ],
  },
  {
    path: '/integrations',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <div>Integrations Page Content</div>,
      },
    ],
  },
  {
    path: '/upgrade-plan',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <div>Upgrade Plan Page Content</div>,
      },
    ],
  },
  {
    path: '/test-dragdrop',
    element: <TestDragDrop />,
  },
  {
    path: '/debug-templates',
    element: <DebugTemplate />,
  },
  {
    path: '/test-template-preview',
    element: <TestTemplatePreview />,
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

  return (
    <RouterProvider router={router} />
  );
}

export default App;