// emailxp/frontend/src/pages/DomainManagement.js
import React, { useEffect, useState, useCallback } from 'react';
import PageContainer from '../components/layout/PageContainer';
import { H1, H2, Muted } from '../components/ui/Typography';
import { listDomains, createDomain, getDomain, verifyDomain, regenerateDkim } from '../services/domainService';
import { CheckCircle, AlertCircle, RefreshCcw, PlusCircle, Globe2, Loader2, Shield, Zap, Target, Copy, Check, Info } from 'lucide-react';

function StatusBadge({ domain }) {
  const base = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200';
  if (domain.status === 'verified') {
    return (
      <span className={`${base} bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 shadow-sm`}>
        <CheckCircle className="w-3 h-3 mr-1.5" />
        Verified
      </span>
    );
  }
  if (domain.status === 'partially_verified') {
    return (
      <span className={`${base} bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200 shadow-sm`}>
        <AlertCircle className="w-3 h-3 mr-1.5" />
        Partial
      </span>
    );
  }
  return (
    <span className={`${base} bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border border-gray-200 shadow-sm`}>
      <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
      Pending
    </span>
  );
}

function DomainCard({ domain, onVerify, verifyingId, onRegenerateDkim, onShowDns }) {
  const isVerified = domain.status === 'verified';
  const isPartiallyVerified = domain.status === 'partially_verified';
  const isVerifying = verifyingId === domain._id;

  return (
    <div className={`relative bg-white rounded-xl shadow-sm border-2 transition-all duration-300 hover:shadow-lg ${
      isVerified ? 'border-green-200 hover:border-green-300' :
      isPartiallyVerified ? 'border-amber-200 hover:border-amber-300' :
      'border-gray-200 hover:border-gray-300'
    } overflow-hidden group`}>

      {/* Primary badge */}
      {domain.isPrimary && (
        <div className="absolute top-4 right-4 z-10">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg">
            <Target className="w-3 h-3 mr-1" />
            Primary
          </span>
        </div>
      )}

      <div className="p-6">
        {/* Domain header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              isVerified ? 'bg-green-100' :
              isPartiallyVerified ? 'bg-amber-100' :
              'bg-gray-100'
            }`}>
              <Globe2 className={`w-5 h-5 ${
                isVerified ? 'text-green-600' :
                isPartiallyVerified ? 'text-amber-600' :
                'text-gray-500'
              }`} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 break-all">{domain.domain}</h3>
              <StatusBadge domain={domain} />
            </div>
          </div>
        </div>

        {/* Verification status grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className={`p-3 rounded-lg border-2 transition-all duration-200 ${
            domain.dkimVerified
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">DKIM</span>
              {domain.dkimVerified ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
            </div>
          </div>

          <div className={`p-3 rounded-lg border-2 transition-all duration-200 ${
            domain.spfVerified
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">SPF</span>
              {domain.spfVerified ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
            </div>
          </div>

          <div className={`p-3 rounded-lg border-2 transition-all duration-200 ${
            domain.trackingVerified
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">Tracking</span>
              {domain.trackingVerified ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
            </div>
          </div>
        </div>

        {/* Last checked info */}
        {domain.lastCheckedAt && (
          <div className="flex items-center text-xs text-gray-500 mb-4">
            <Info className="w-3 h-3 mr-1" />
            Last checked {new Date(domain.lastCheckedAt).toLocaleString()}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <VerifyAction
              domain={domain}
              onVerify={onVerify}
              verifying={isVerifying}
            />
            <button
              onClick={() => onRegenerateDkim(domain._id)}
              className="inline-flex items-center px-3 py-2 text-xs font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
            >
              <RefreshCcw className="w-3 h-3 mr-1.5" />
              Regenerate DKIM
            </button>
          </div>

          <button
            onClick={() => onShowDns(domain)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
          >
            <Shield className="w-4 h-4 mr-2" />
            View DNS
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DomainManagement({ embedded = false, active = true, onLoaded }) {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [rootDomain, setRootDomain] = useState('');
  const [error, setError] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);
  const [showDnsFor, setShowDnsFor] = useState(null);
  const [copyState, setCopyState] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listDomains();
      setDomains(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
      setDomains([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (active) {
      load().then(() => { onLoaded && onLoaded(); });
    }
  }, [active, load, onLoaded]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    setCreating(true);
    setError(null);
    try {
      const created = await createDomain(newDomain.trim());
      setNewDomain('');
      setSuccessMessage(`Domain "${created.domain}" added successfully!`);
      await load();
      setShowDnsFor(created);

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleVerify = async (id) => {
    setVerifyingId(id);
    setError(null);
    try {
      await verifyDomain(id);
      setSuccessMessage('Domain verification completed!');
      await load();

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleRegenerateDkim = async (id) => {
    try {
      await regenerateDkim(id);
      setSuccessMessage('DKIM key regenerated successfully!');
      await load();

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  const handleQuickSetup = async () => {
    if (!rootDomain.trim()) return;

    setCreating(true);
    setError(null);
    try {
      const subdomains = [
        `mail.${rootDomain.trim()}`,
        `pages.${rootDomain.trim()}`,
        `forms.${rootDomain.trim()}`,
        `track.${rootDomain.trim()}`
      ];

      const createdDomains = [];
      for (const subdomain of subdomains) {
        try {
          const created = await createDomain(subdomain);
          createdDomains.push(created);
        } catch (e) {
          // If one fails, continue with others but show warning
          console.warn(`Failed to create ${subdomain}:`, e.message);
        }
      }

      if (createdDomains.length > 0) {
        setSuccessMessage(`Successfully created ${createdDomains.length} subdomains! Configure DNS records to complete setup.`);
        await load();
        setShowDnsFor(createdDomains[0]); // Show DNS for the first created domain
      } else {
        setError('Failed to create any subdomains. Please try again.');
      }

      setRootDomain('');

      // Clear success message after 10 seconds (longer for multiple domains)
      setTimeout(() => setSuccessMessage(null), 10000);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setCreating(false);
    }
  };

  const hasRootDomain = domains.some(d => !d.domain.includes('.')) || domains.some(d => {
    const parts = d.domain.split('.');
    return parts.length === 2; // Simple check for root domains
  });

  const primary = Array.isArray(domains) ? domains.find(d => d.isPrimary) : null;
  const verifiedCount = domains.filter(d => d.status === 'verified').length;

  return (
    <PageContainer>
      <div className={embedded ? '' : 'max-w-6xl mx-auto'} role={embedded ? undefined : 'main'} aria-labelledby={embedded ? undefined : 'domains-heading'}>

        {/* Header Section */}
        {!embedded && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Globe2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <H1 id="domains-heading" className="!mb-1 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Sending Domains
                  </H1>
                  <p className="text-gray-600 text-lg">Manage your verified domains for professional email delivery</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{domains.length}</div>
                  <div className="text-sm text-gray-500">Total Domains</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{verifiedCount}</div>
                  <div className="text-sm text-gray-500">Verified</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Why verify domains?</h3>
                  <p className="text-gray-700 mb-3">
                    Verified domains improve deliverability and build trust with email providers.
                    Use subdomains like <code className="bg-white px-2 py-1 rounded border text-sm">mail.yourcompany.com</code> for best results.
                  </p>
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span className="text-gray-600">DKIM Authentication</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-600">SPF Protection</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-purple-600" />
                      <span className="text-gray-600">Tracking Analytics</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {embedded && (
          <div className="mb-6">
            <H2 className="flex items-center gap-3 text-gray-900">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <Globe2 className="w-5 h-5 text-white" />
              </div>
              Sending Domains
            </H2>
            <Muted className="mt-2">Add and verify domains for professional email delivery</Muted>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-1 bg-green-100 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-green-800 font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="p-1 bg-red-100 rounded-full mt-0.5">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Add Domain Form */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Add New Domain</h3>
            <div className="text-sm text-gray-500">
              {domains.length} of 10 domains used
            </div>
          </div>

          {/* Quick Setup Section */}
          {!hasRootDomain && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">Quick Domain Setup</h4>
                  <p className="text-sm text-blue-800 mb-3">
                    Enter your root domain and we'll automatically create the recommended subdomains for professional email marketing:
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1 mb-4">
                    <li>• <strong>mail.yourdomain.com</strong> - Email sending</li>
                    <li>• <strong>pages.yourdomain.com</strong> - Landing pages</li>
                    <li>• <strong>forms.yourdomain.com</strong> - Form collection</li>
                    <li>• <strong>track.yourdomain.com</strong> - Email tracking</li>
                  </ul>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <label htmlFor="root-domain" className="block text-sm font-medium text-gray-700 mb-2">
                        Your Root Domain
                      </label>
                      <input
                        id="root-domain"
                        type="text"
                        value={rootDomain}
                        onChange={e => setRootDomain(e.target.value)}
                        placeholder="yourcompany.com"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                        disabled={creating}
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleQuickSetup}
                        disabled={creating || !rootDomain.trim()}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                      >
                        {creating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Setting up...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Quick Setup
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-blue-700">
                    💡 This creates 4 subdomains automatically following email marketing best practices.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Or Add Individual Domains</h4>

          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="new-domain" className="block text-sm font-medium text-gray-700 mb-2">
                Domain
              </label>
              <input
                id="new-domain"
                type="text"
                value={newDomain}
                onChange={e => setNewDomain(e.target.value)}
                placeholder="yourcompany.com"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                aria-required="true"
                disabled={creating}
              />
              <p className="mt-2 text-sm text-gray-600">
                Enter your domain name (e.g., <strong>example.com</strong>)
              </p>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={creating || !newDomain.trim()}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Domain
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Domains List */}
        {(active && loading) ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Your Domains</h3>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                      <div className="space-y-2">
                        <div className="w-32 h-4 bg-gray-200 rounded"></div>
                        <div className="w-16 h-3 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[1, 2, 3].map(j => (
                        <div key={j} className="h-12 bg-gray-200 rounded-lg"></div>
                      ))}
                    </div>
                    <div className="flex justify-between">
                      <div className="w-20 h-8 bg-gray-200 rounded"></div>
                      <div className="w-24 h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (active && Array.isArray(domains) && domains.length === 0) ? (
          <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-gray-200 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Globe2 className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No domains yet</h3>
              <p className="text-gray-600 mb-6">
                Add your first domain above to start sending professional emails with proper authentication.
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>DKIM</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>SPF</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>Tracking</span>
                </div>
              </div>
            </div>
          </div>
        ) : (active) ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Your Domains</h3>
              <div className="text-sm text-gray-500">
                {verifiedCount} of {domains.length} verified
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.isArray(domains) && domains.map(d => (
                <DomainCard
                  key={d._id}
                  domain={d}
                  onVerify={() => handleVerify(d._id)}
                  verifyingId={verifyingId}
                  onRegenerateDkim={handleRegenerateDkim}
                  onShowDns={async (domain) => {
                    // If domain doesn't have DNS records, fetch them
                    if (!domain.dkimRecord && !domain.dkim) {
                      try {
                        const fullDomain = await getDomain(domain._id);
                        setShowDnsFor(fullDomain);
                      } catch (error) {
                        console.error('Failed to fetch domain details:', error);
                        setShowDnsFor(domain); // Fallback to basic domain info
                      }
                    } else {
                      setShowDnsFor(domain);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        ) : <div></div>}
        </div>

        {/* DNS Records Modal */}
        {showDnsFor ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full h-full max-w-none max-h-none overflow-hidden pointer-events-auto">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">DNS Records for {showDnsFor.domain}</h3>
                      <p className="text-blue-100 text-sm">Add these records to your DNS provider</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDnsFor(null)}
                    className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex h-full">
                {/* Left Column - DNS Records */}
                <div className="w-1/2 p-6 border-r border-gray-200 overflow-y-auto">
                  <div className="mb-6">
                    <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-blue-800 font-medium">Important</p>
                        <p className="text-blue-700 text-sm mt-1">
                          DNS changes may take up to 24 hours to propagate. Verification may take a few minutes after propagation.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">DNS Records</h4>
                    <DnsRow
                      label="DKIM"
                      type={showDnsFor.dkim?.type || showDnsFor.dkimRecord?.type || "CNAME"}
                      host={showDnsFor.dkim?.name || showDnsFor.dkimRecord?.name || `dkim1._domainkey.${showDnsFor.domain}`}
                      value={showDnsFor.dkim?.value || showDnsFor.dkimRecord?.value || `dkim1.${showDnsFor.domain}`}
                      setCopyState={setCopyState}
                      copyState={copyState}
                    />
                    <DnsRow
                      label="SPF"
                      type={showDnsFor.spf?.type || showDnsFor.spfRecord?.type || "TXT"}
                      host={showDnsFor.spf?.name || showDnsFor.spfRecord?.name || showDnsFor.domain}
                      value={showDnsFor.spf?.value || showDnsFor.spfRecord?.value || 'v=spf1 include:spf.resend.com ~all'}
                      setCopyState={setCopyState}
                      copyState={copyState}
                    />
                    <DnsRow
                      label="Tracking"
                      type={showDnsFor.tracking?.type || showDnsFor.trackingRecord?.type || "CNAME"}
                      host={showDnsFor.tracking?.name || showDnsFor.trackingRecord?.name || `track.${showDnsFor.domain}`}
                      value={showDnsFor.tracking?.value || showDnsFor.trackingRecord?.value || 'tracking.emailxp.com'}
                      setCopyState={setCopyState}
                      copyState={copyState}
                    />
                  </div>
                </div>

                {/* Right Column - Instructions and Actions */}
                <div className="w-1/2 p-6 overflow-y-auto">
                  <div className="space-y-6">
                    {/* General DNS Setup Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-blue-900 mb-1">DNS Setup Instructions</h4>
                          <p className="text-sm text-blue-800 mb-2">
                            Add these DNS records to your domain provider. Most providers support CSV import or manual entry:
                          </p>
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm font-medium text-blue-900">Popular DNS Providers:</p>
                              <ul className="text-sm text-blue-800 list-disc list-inside ml-4 space-y-1">
                                <li><strong>GoDaddy:</strong> Domain Settings → DNS Management → Add Record</li>
                                <li><strong>Namecheap:</strong> Domain List → Manage → Advanced DNS</li>
                                <li><strong>Cloudflare:</strong> DNS → Records → Import CSV or Add Record</li>
                                <li><strong>Route 53 (AWS):</strong> Hosted Zones → Create Record</li>
                                <li><strong>DigitalOcean:</strong> Networking → Domains → Add Record</li>
                              </ul>
                            </div>
                            <div className="mt-3 p-2 bg-blue-100 rounded text-sm text-blue-900">
                              <strong>Tip:</strong> Copy each record individually or download the CSV file below for bulk import.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CSV Download Section */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Bulk Import Option</h4>
                      <p className="text-sm text-gray-700 mb-3">
                        Download a CSV file with all DNS records for easy bulk import into your DNS provider.
                      </p>
                      <button
                        onClick={() => {
                          try {
                            // Generate DNS records in standard CSV format compatible with most providers
                            // Format: Name,Type,Value,TTL
                            const dkimName = showDnsFor.dkim?.name || showDnsFor.dkimRecord?.name || `dkim1._domainkey.${showDnsFor.domain}`;
                            const dkimValue = showDnsFor.dkim?.value || showDnsFor.dkimRecord?.value || `dkim1.${showDnsFor.domain}`;
                            const spfName = showDnsFor.spf?.name || showDnsFor.spfRecord?.name || showDnsFor.domain;
                            const spfValue = showDnsFor.spf?.value || showDnsFor.spfRecord?.value || 'v=spf1 include:spf.resend.com ~all';
                            const trackingName = showDnsFor.tracking?.name || showDnsFor.trackingRecord?.name || `track.${showDnsFor.domain}`;
                            const trackingValue = showDnsFor.tracking?.value || showDnsFor.trackingRecord?.value || 'tracking.emailxp.com';

                            const csvHeader = 'Name,Type,Value,TTL\n';
                            const records = [
                              `${dkimName},CNAME,${dkimValue},300`,
                              `${spfName},TXT,"${spfValue}",300`,
                              `${trackingName},CNAME,${trackingValue},300`
                            ].join('\n');

                            const csvContent = csvHeader + records;
                            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${showDnsFor.domain.replace(/\./g, '-')}-dns-records.csv`;
                            a.style.display = 'none';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          } catch (error) {
                            console.error('Error downloading CSV:', error);
                            alert('Failed to download CSV. Please try again.');
                          }
                        }}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download CSV
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowDnsFor(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                >
                  I'll do this later
                </button>
                <button
                  onClick={async () => {
                    if (showDnsFor?._id) {
                      const id = showDnsFor._id;
                      setShowDnsFor(null);
                      await handleVerify(id);
                    }
                  }}
                  className="inline-flex items-center px-6 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                  Done, Verify Now
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Footer Information */}
        {active && primary ? (
          <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-green-900 mb-2">Ready to Send!</h4>
                <p className="text-green-800 mb-3">
                  Your emails will be sent from <code className="bg-white px-2 py-1 rounded border text-sm font-mono">no-reply@{primary.domain}</code>
                </p>
                <p className="text-green-700 text-sm">
                  This address is automatically configured based on your verified domain for optimal deliverability.
                </p>
              </div>
            </div>
          </div>
        ) : active ? (
          <div className="mt-8 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border border-amber-200">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-amber-900 mb-2">Domain Verification Required</h4>
                <p className="text-amber-800 mb-3">
                  Add DNS records for DKIM, SPF, and tracking, then click "Verify DNS" to enable sending.
                </p>
                <div className="flex items-center space-x-4 text-sm text-amber-700">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Authentication</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4" />
                    <span>Deliverability</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>Analytics</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </PageContainer>
  );
}

// Enhanced DNS Row Component
function DnsRow({ label, type, host, value, setCopyState, copyState }) {
  const id = label.toLowerCase();
  const copy = async (text, which) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState({ which, ts: Date.now() });
      setTimeout(() => {
        setCopyState(cs => (cs && cs.which === which ? null : cs));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'CNAME': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'TXT': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'MX': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getIcon = (label) => {
    switch (label) {
      case 'DKIM': return <Shield className="w-4 h-4" />;
      case 'SPF': return <Target className="w-4 h-4" />;
      case 'Tracking': return <Zap className="w-4 h-4" />;
      default: return <Globe2 className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-5 hover:border-gray-300 transition-all duration-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            {getIcon(label)}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{label}</h4>
            <p className="text-sm text-gray-600">DNS Record</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(type)}`}>
          {type}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Host / Name</label>
          <div className="flex items-center space-x-2">
            <code className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-900 break-all">
              {host}
            </code>
            <button
              type="button"
              onClick={() => copy(host, `${id}-host`)}
              className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
            >
              {copyState && copyState.which === `${id}-host` ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              <span className="ml-2">
                {copyState && copyState.which === `${id}-host` ? 'Copied!' : 'Copy'}
              </span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
          <div className="flex items-center space-x-2">
            <code className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-gray-900 break-all">
              {value}
            </code>
            <button
              type="button"
              onClick={() => copy(value, `${id}-value`)}
              className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
            >
              {copyState && copyState.which === `${id}-value` ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              <span className="ml-2">
                {copyState && copyState.which === `${id}-value` ? 'Copied!' : 'Copy'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Verify action chip/button component
function VerifyAction({ domain, onVerify, verifying }) {
  const base = 'inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md border transition-colors';
  if (domain.status === 'verified') {
    return <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-green-100 text-green-700 text-xs font-medium"><CheckCircle className="w-3 h-3 mr-1" /> Verified</span>;
  }
  if (verifying) {
    return <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-700 text-xs font-medium"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Verifying…</span>;
  }
  // Partial vs pending
  const isPartial = domain.status === 'partially_verified';
  return (
    <button
      type="button"
      onClick={onVerify}
      className={`${base} ${isPartial ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
    >
      {isPartial ? 'Re-verify' : 'Verify DNS'}
    </button>
  );
}
