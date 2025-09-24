import React from 'react';
import ListHealthPanel from '../../components/panels/ListHealthPanel';

export default function SubscribersPanel({ subscriberStats, metricsLoading }) {
  if (metricsLoading) return <Skeleton />;
  return (
    <div aria-label="subscribers-panel" className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Subscriber Metrics</h2>
      {!subscriberStats ? <p className="text-sm text-gray-500">No subscriber stats available.</p> : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Metric label="Total Subscribers" value={subscriberStats.total || subscriberStats.totalSubscribers || 0} />
          <Metric label="New (30d)" value={subscriberStats.newLast30Days || 0} />
          <Metric label="Unsubscribed" value={subscriberStats.unsubscribed || 0} />
          <Metric label="Inactive" value={subscriberStats.inactive || 0} />
        </div>
      )}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <ListHealthPanel days={30} />
      </div>
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
  return <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="subscribers-loading">{Array.from({length:4}).map((_,i)=><div key={i} className="h-24 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />)}</div>;
}
