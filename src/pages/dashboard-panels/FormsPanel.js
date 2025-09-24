import React from 'react';

export default function FormsPanel({ formStats, metricsLoading }) {
  if (metricsLoading) return <Skeleton />;
  return (
    <div aria-label="forms-panel" className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Forms</h2>
      {!formStats ? <p className="text-sm text-gray-500">No form data.</p> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Metric label="Total Forms" value={formStats.total} />
          <Metric label="Total Submissions" value={formStats.totalSubmissions} />
          <Metric label="Avg Submissions / Form" value={formStats.avgSubmissionsPerForm?.toFixed(1)||'0.0'} />
          <Metric label="Active Forms" value={formStats.activeForms || formStats.total} />
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
  return <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="forms-loading">{Array.from({length:4}).map((_,i)=><div key={i} className="h-24 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />)}</div>;
}
