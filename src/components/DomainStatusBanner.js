import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { listDomains } from '../services/domainService';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

/**
 * Displays a warning banner if the user previously had a verified domain (flag true historically)
 * but currently lacks a verified domain (server cleared flag due to regression).
 * Assumes server clears user.hasVerifiedDomain when all domains lose verification.
 */
export default function DomainStatusBanner() {
  const { user } = useSelector(state => state.auth);
  const [domainMeta, setDomainMeta] = useState({ checked: false, hasAny: false, hadHistoricalVerified: false });

  useEffect(() => {
    let active = true;
    async function fetchDomains() {
      if (!user || !user.isVerified) { setDomainMeta({ checked: true, hasAny: false, hadHistoricalVerified: false }); return; }
      try {
  const data = await listDomains();
  const domains = Array.isArray(data) ? data : (data.domains || []);
        const hasAny = domains.length > 0;
        // Determine if any domain was ever verified (using fields like verifiedAt or status)
        const hadHistoricalVerified = domains.some(d => d.verifiedAt || d.status === 'verified' || d.previousVerified === true);
        if (active) setDomainMeta({ checked: true, hasAny, hadHistoricalVerified });
      } catch (e) {
        if(e?.message === 'AUTH_REQUIRED') return; // auth reset already handled
        if (active) setDomainMeta({ checked: true, hasAny: false, hadHistoricalVerified: false });
      }
    }
    fetchDomains();
    return () => { active = false; };
  }, [user]);

  if (!user) return null;
  // Only show if: email verified, currently no verified domain, and (had at least one domain before OR previously verified one)
  if (user.isVerified && !user.hasVerifiedDomain && domainMeta.checked && (domainMeta.hasAny || domainMeta.hadHistoricalVerified)) {
    return (
      <div className="mb-4 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3 flex items-start text-sm text-yellow-800">
        <ExclamationTriangleIcon className="h-5 w-5 mr-3 flex-shrink-0" />
        <div>
          <p className="font-medium mb-1">Sending domain needs attention</p>
          <p className="mb-2">Your previously verified (or configured) sending domain can no longer be fully verified. Sending is paused until it is fixed.</p>
          <a href="/settings#domains" className="inline-flex text-yellow-900 font-medium underline underline-offset-2 hover:text-yellow-700">Review Domains</a>
        </div>
      </div>
    );
  }
  return null;
}
