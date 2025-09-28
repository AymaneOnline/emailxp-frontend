// emailxp/frontend/src/pages/DomainManagement.js
import React, { useEffect, useState, useCallback } from 'react';
import PageContainer from '../components/layout/PageContainer';
import { H1, H2, H3, Body, Muted, Small } from '../components/ui/Typography';
import { listDomains, createDomain, verifyDomain, regenerateDkim } from '../services/domainService';
import { CheckCircle, AlertCircle, RefreshCcw, PlusCircle, Globe2, Loader2 } from 'lucide-react';

function StatusBadge({ domain }) {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium';
  if (domain.status === 'verified') return <span className={`${base} bg-green-100 text-green-800`}>Verified</span>;
  if (domain.status === 'partially_verified') return <span className={`${base} bg-yellow-100 text-yellow-800`}>Partial</span>;
  return <span className={`${base} bg-gray-100 text-gray-700`}>Pending</span>;
}

export default function DomainManagement({ embedded = false, active = true, onLoaded }) {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [error, setError] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);
  const [showDnsFor, setShowDnsFor] = useState(null); // domain object for which we show DNS records
  const [copyState, setCopyState] = useState(null); // which record recently copied

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listDomains();
      setDomains(data);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (active) { load().then(()=>{ onLoaded && onLoaded(); }); } }, [active, load, onLoaded]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newDomain) return;
    setCreating(true); setError(null);
    try {
      const created = await createDomain(newDomain);
      setNewDomain('');
      await load();
      setShowDnsFor(created); // show DNS records panel for new domain
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleVerify = async (id) => {
    setVerifyingId(id);
    try {
      await verifyDomain(id);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setVerifyingId(null);
    }
  };

  const primary = Array.isArray(domains) ? domains.find(d => d.isPrimary) : null;

  return (
    <PageContainer>
    <div className={embedded ? '' : 'max-w-5xl mx-auto'} role={embedded ? undefined : 'main'} aria-labelledby={embedded ? undefined : 'domains-heading'}>
      {!embedded && (
        <>
          <div className="flex items-center mb-4 space-x-3">
            <Globe2 className="w-7 h-7 text-primary-red" />
            <H1 id="domains-heading" className="!mb-0">Sending Domains</H1>
          </div>
          <Body className="mb-8 max-w-3xl">Add and verify a dedicated subdomain to send emails. A domain is fully verified when DKIM, SPF and tracking records are detected. Only verified domains can be used for sending. Use a subdomain like <code className="bg-gray-100 px-1 rounded">mail.example.com</code>.</Body>
        </>
      )}
      {embedded && (
        <div className="mb-6">
          <H2 className="flex items-center gap-2 text-gray-900"><Globe2 className="w-5 h-5 text-primary-red" /> Sending Domains</H2>
          <Muted className="mt-1">Add and verify a subdomain (DKIM, SPF, tracking) to enable sending.</Muted>
        </div>
      )}

      <form onSubmit={handleCreate} className="mb-10 bg-white shadow rounded-lg p-4 flex items-end space-x-4 border border-gray-200" aria-label="Add domain form">
        <div className="flex-1">
          <Small className="block font-medium text-gray-700 mb-1">New Subdomain</Small>
          <input
            type="text"
            value={newDomain}
            onChange={e => setNewDomain(e.target.value)}
            placeholder="mail.yourdomain.com"
            className="w-full rounded-md border-gray-300 focus:ring-primary-red focus:border-primary-red text-sm"
            aria-required="true"
          />
          <Small className="mt-1 text-gray-500">Must be a subdomain (at least 3 parts, e.g. <strong>mail.example.com</strong>).</Small>
        </div>
        <button type="submit" disabled={creating} className="inline-flex items-center px-4 py-2 bg-primary-red text-white text-sm font-medium rounded-md shadow hover:bg-primary-red-darker focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-red disabled:opacity-60">
          <PlusCircle className="w-4 h-4 mr-2" />
          {creating ? 'Adding...' : 'Add Domain'}
        </button>
      </form>

  {error && <Small role="alert" className="mb-6 p-3 rounded bg-red-50 border border-red-200 text-red-700 flex items-start"><AlertCircle className="w-4 h-4 mr-2 mt-0.5" />{error}</Small>}

      {active && loading ? (
        <div className="space-y-4" aria-live="polite" aria-busy="true">
          <div className="h-4 w-52 bg-gray-200 rounded animate-pulse" />
          <div className="space-y-3">
            {[1,2].map(i => (
              <div key={i} className="bg-white shadow-sm border border-gray-200 rounded-md p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-3 w-36 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-14 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="flex flex-wrap gap-3 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] rounded bg-gray-100 text-gray-400 border border-gray-200">DKIM</span>
                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] rounded bg-gray-100 text-gray-400 border border-gray-200">SPF</span>
                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] rounded bg-gray-100 text-gray-400 border border-gray-200">Tracking</span>
                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] rounded bg-gray-50 text-gray-300 border border-dashed border-gray-300">Last check…</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <div className="h-7 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : active && Array.isArray(domains) && domains.length === 0 ? (
  <Body className="text-gray-600">No domains yet. Add your first subdomain above.</Body>
      ) : active && Array.isArray(domains) && domains.length > 0 ? (
        <div className="space-y-4" aria-live="polite">
          {domains.map(d => (
            <div key={d._id} className="bg-white shadow-sm border border-gray-200 rounded-md p-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 break-all">{d.domain}</span>
                  {d.isPrimary && <span className="text-[10px] uppercase tracking-wide bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">Primary</span>}
                  <StatusBadge domain={d} />
                </div>
                <div className="mt-1 text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
                  <span className={d.dkimVerified ? 'text-green-600 flex items-center space-x-1' : 'flex items-center space-x-1'}>
                    {d.dkimVerified ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}<span>DKIM</span>
                  </span>
                  <span className={d.spfVerified ? 'text-green-600 flex items-center space-x-1' : 'flex items-center space-x-1'}>
                    {d.spfVerified ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}<span>SPF</span>
                  </span>
                  <span className={d.trackingVerified ? 'text-green-600 flex items-center space-x-1' : 'flex items-center space-x-1'}>
                    {d.trackingVerified ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}<span>Tracking</span>
                  </span>
                  {d.lastCheckedAt && <span>Checked {new Date(d.lastCheckedAt).toLocaleTimeString()}</span>}
                </div>
              </div>
              <div className="mt-3 md:mt-0 flex items-center space-x-2">
                <VerifyAction
                  domain={d}
                  onVerify={() => handleVerify(d._id)}
                  verifying={verifyingId === d._id}
                />
                <button onClick={() => regenerateDkim(d._id).then(load).catch(e=>setError(e.response?.data?.message||e.message))} className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 hover:bg-gray-50 inline-flex items-center space-x-1">
                  <RefreshCcw className="w-3 h-3" /> <span>Regenerate DKIM</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {showDnsFor && (
        <div className="mt-10 bg-white border border-indigo-200 rounded-md shadow-sm p-5" aria-live="polite">
          <div className="flex items-start justify-between mb-3">
            <H3 className="flex items-center gap-2 mb-0">DNS Records for {showDnsFor.domain}</H3>
            <Small as="button" onClick={()=>setShowDnsFor(null)} className="cursor-pointer text-gray-500 hover:text-gray-700">Dismiss</Small>
          </div>
          <Muted className="mb-4 normal-case !text-gray-600">Add these DNS records at your DNS provider. Verification may take a few minutes after propagation.</Muted>
          <div className="space-y-4">
            <DnsRow label="DKIM" type="CNAME" host={showDnsFor.dkimHost || `dkim._domainkey.${showDnsFor.domain}`} value={showDnsFor.dkimValue || `dkim.${showDnsFor.domain}` } setCopyState={setCopyState} copyState={copyState} />
            <DnsRow label="SPF" type="TXT" host={showDnsFor.domain} value={showDnsFor.spfValue || 'v=spf1 include:emailxp.net ~all'} setCopyState={setCopyState} copyState={copyState} />
            <DnsRow label="Tracking" type="CNAME" host={showDnsFor.trackingHost || `track.${showDnsFor.domain}`} value={showDnsFor.trackingValue || 'tracking.emailxp.net'} setCopyState={setCopyState} copyState={copyState} />
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button onClick={()=>{ if(showDnsFor?._id){ const id = showDnsFor._id; setShowDnsFor(null); handleVerify(id); } }} className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary-red text-white hover:bg-primary-red-darker">
              <Small className="!text-white font-medium">Done, Verify</Small>
            </button>
            <button onClick={()=>setShowDnsFor(null)} className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 hover:bg-gray-50">
              <Small className="font-medium text-gray-700">Later</Small>
            </button>
          </div>
        </div>
      )}
      {active && primary ? (
        <Small className="mt-10 text-gray-600 bg-gray-50 border border-gray-200 rounded p-4 block">
          Emails will be sent from <code className="bg-white px-1 rounded border">no-reply@{primary.domain}</code>. In future you will be able to set a custom default From name/address.
        </Small>
      ) : active ? (
        <Small className="mt-10 text-amber-700 bg-amber-50 border border-amber-200 rounded p-4 block">
          No verified domain yet. Add DNS records for DKIM, SPF and tracking then click Verify.
        </Small>
      ) : null}
    </div>
    </PageContainer>
  );
}

// Inline component for DNS rows
function DnsRow({ label, type, host, value, setCopyState, copyState }){
  const id = label.toLowerCase();
  const copy = async (text, which) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState({ which, ts: Date.now() });
      setTimeout(()=>{ setCopyState(cs => (cs && cs.which===which ? null : cs)); }, 2000);
    } catch {}
  };
  const active = copyState && copyState.which===id;
  return (
    <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold text-gray-700">{label}</span>
        <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 border border-indigo-200">{type}</span>
      </div>
      <div className="grid md:grid-cols-2 gap-3 text-[11px] font-mono break-all">
        <div>
          <span className="block text-gray-500 mb-0.5">Host / Name</span>
          <div className="flex items-center gap-2">
            <code className="bg-white rounded px-1 py-0.5 border border-gray-200 flex-1 overflow-hidden">{host}</code>
            <button type="button" onClick={()=>copy(host,id+'-host')} className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-[10px] font-medium">{active && copyState.which===id+'-host' ? 'Copied' : 'Copy'}</button>
          </div>
        </div>
        <div>
          <span className="block text-gray-500 mb-0.5">Value</span>
          <div className="flex items-center gap-2">
            <code className="bg-white rounded px-1 py-0.5 border border-gray-200 flex-1 overflow-hidden">{value}</code>
            <button type="button" onClick={()=>copy(value,id+'-value')} className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-[10px] font-medium">{active && copyState.which===id+'-value' ? 'Copied' : 'Copy'}</button>
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
