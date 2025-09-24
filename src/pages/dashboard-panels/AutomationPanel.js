import React, { useMemo } from 'react';
import { MiniBarChart } from './charts';

export default function AutomationPanel({ automationStats, metricsLoading }) {
  const statusChartData = useMemo(() => {
    if (!automationStats?.statuses) return [];
    return Object.entries(automationStats.statuses).map(([status, count]) => ({
      label: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }));
  }, [automationStats]);

  if (metricsLoading) return <Skeleton />;
  const statuses = automationStats?.statuses || {};
  return (
    <div aria-label="automation-panel" className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Automation</h2>
      {!automationStats ? <p className="text-sm text-gray-500">No automation data.</p> : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Metric label="Total" value={automationStats.total} />
            <Metric label="Active" value={statuses.active || 0} />
            <Metric label="Paused" value={statuses.paused || 0} />
            <Metric label="Draft" value={statuses.draft || 0} />
          </div>
          {statusChartData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4" aria-label="automation-status-chart">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Automation Status Distribution</h3>
              <MiniBarChart data={statusChartData} />
            </div>
          )}
        </>
      )}
    </div>
  );
}function Metric({ label, value }) {
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
