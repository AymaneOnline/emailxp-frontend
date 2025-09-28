// emailxp/frontend/src/components/PrivateRoute.js

import React from 'react';
import { Navigate } from 'react-router-dom';
import devLog from '../utils/devLog';

function PrivateRoute({ children }) {
  // Check if user is logged in (e.g., by checking localStorage for a token/user object)
  const user = localStorage.getItem('user'); // This is the key line

  devLog('[PrivateRoute] Checking authentication. User in localStorage:', user ? 'present' : 'absent'); // DEBUG LOG

  if (!user) {
    // If not authenticated, redirect to the login page
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child components (the protected route's content)
  return children;
}

export default PrivateRoute;