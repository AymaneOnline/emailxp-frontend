import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { isOnboardingComplete } from '../utils/onboarding';

export default function RequireOnboardingComplete({ children }) {
  const { user } = useSelector(s=>s.auth);
  const location = useLocation();

  if(!user) {
    // Let existing auth guard / login redirect handle if present; fallback to root
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if(!isOnboardingComplete(user)) {
    // Allow profile/settings and domains routes so user can finish onboarding steps
    if(location.pathname.startsWith('/settings')) {
      return children;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
