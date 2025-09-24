import React from 'react';

export default function SitesPanel({ siteStats, metricsLoading }) {
  if (metricsLoading) return <Skeleton />;
  return (
    <div aria-label="sites-panel" className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sites & Landing Pages</h2>
      {!siteStats ? <p className="text-sm text-gray-500">No site data.</p> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Metric label="Total Pages" value={siteStats.total} />
          <Metric label="Active" value={siteStats.active} />
          <Metric label="Draft" value={siteStats.draft} />
          <Metric label="Recently Updated" value={siteStats.recent} />
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800" aria-label={`metric-${label.toLowerCase().replace(/\s/g,'-')}`}> 
      <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-xl font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function Skeleton(){
  return <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="sites-loading">{Array.from({length:4}).map((_,i)=><div key={i} className="h-24 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />)}</div>;
}
