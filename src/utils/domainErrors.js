import { toast } from 'react-toastify';
// Import store explicitly from store/store to fix path resolution
import { store } from '../store/store';

export function handleDomainError(err, navigate) {
  const code = err?.response?.data?.code || err?.code;
  if (code === 'DOMAIN_NOT_VERIFIED') {
    toast.warning('A verified sending domain is required for this action. Add one now.');
    // Navigate with hash to auto-activate Domains tab
    navigate('/settings#domains');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-domains-tab'));
    }
    return true;
  }
  return false;
}

export function userHasVerifiedDomain() {
  const state = store.getState();
  return !!state.auth?.user?.hasVerifiedDomain;
}

export function domainRequirementTooltip(hasDomain, actionLabel = 'perform this action') {
  return hasDomain ? '' : `Verify a sending domain first to ${actionLabel}.`;
}