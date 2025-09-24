import React, { useMemo } from 'react';
import { MiniBarChart } from './charts';

export default function FormsPanel({ formStats, metricsLoading }) {
  const chartData = useMemo(() => {
    if (!formStats?.forms) return [];
    return formStats.forms.slice(0, 8).map(form => ({
      label: form.name?.slice(0, 10) || 'Unnamed',
      value: form.submissionCount || 0
    }));
  }, [formStats]);

  if (metricsLoading) return <Skeleton />;
  return (
    <div aria-label="forms-panel" className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Forms</h2>
      {!formStats ? <p className="text-sm text-gray-500">No form data.</p> : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Metric label="Total Forms" value={formStats.total} />
            <Metric label="Total Submissions" value={formStats.totalSubmissions} />
            <Metric label="Avg Submissions / Form" value={formStats.avgSubmissionsPerForm?.toFixed(1)||'0.0'} />
            <Metric label="Active Forms" value={formStats.activeForms || formStats.total} />
          </div>
          {chartData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4" aria-label="form-submissions-chart">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Form Submissions</h3>
              <MiniBarChart data={chartData} />
            </div>
          )}
        </>
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
