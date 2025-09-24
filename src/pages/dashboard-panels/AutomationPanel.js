import React from 'react';

export default function AutomationPanel({ automationStats, metricsLoading }) {
  if (metricsLoading) return <Skeleton />;
  const statuses = automationStats?.statuses || {};
  return (
    <div aria-label="automation-panel" className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Automation</h2>
      {!automationStats ? <p className="text-sm text-gray-500">No automation data.</p> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Metric label="Total" value={automationStats.total} />
          <Metric label="Active" value={statuses.active || 0} />
            <Metric label="Paused" value={statuses.paused || 0} />
          <Metric label="Draft" value={statuses.draft || 0} />
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
  return <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="automation-loading">{Array.from({length:4}).map((_,i)=><div key={i} className="h-24 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />)}</div>;
}
