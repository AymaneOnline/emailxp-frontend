import React, { useMemo } from 'react';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { Mail, Users, MousePointer, Eye } from 'lucide-react';
import { useEngagementFunnel } from '../../hooks/useEngagementFunnel';
import EngagementFunnel from '../../components/charts/EngagementFunnel';
import useCampaignTrends from '../../hooks/useCampaignTrends';

export default function OverviewPanel({ overview, subscriberStats, quickStats, metricsLoading, setActiveTab }) {
  // Hooks must run unconditionally
  const metrics = useMemo(()=>{
    const o = overview || {};
    return {
      sent: o.totalSent || 0,
      delivered: o.totalDelivered || 0,
      openRate: o.openRate || 0,
      clickRate: o.clickRate || 0,
      unsubRate: o.unsubRate || 0,
    };
  }, [overview]);
  const trendData = useCampaignTrends(quickStats);
  const { data: funnelData, isLoading: funnelLoading } = useEngagementFunnel('30d');

  // Show 6-up layout only on very large (2xl) screens to avoid cramped cards at common laptop widths (~1366px)
  if (metricsLoading) return <div aria-label="overview-loading" aria-live="polite" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4 animate-pulse">{Array.from({length:6}).map((_,i)=><div key={i} className="h-32 rounded-xl bg-gray-100 dark:bg-gray-800" />)}</div>;
  if (!overview) return <p className="text-sm text-gray-500" aria-live="polite">No data yet.</p>;

  const { sent, delivered, openRate, clickRate, unsubRate } = metrics;

  return (
    <div className="space-y-4" aria-label="overview-panel">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4">
        <MetricCard title="Sent" value={sent} icon={Mail} description="Emails" loading={metricsLoading} onClick={()=>setActiveTab('campaigns')} ariaLabel="stat-sent" />
        <MetricCard title="Delivered" value={delivered} icon={Mail} description="Successful" loading={metricsLoading} onClick={()=>setActiveTab('campaigns')} ariaLabel="stat-delivered" />
        <MetricCard title="Open Rate" value={`${openRate.toFixed(1)}%`} icon={Eye} description="Avg opens" loading={metricsLoading} onClick={()=>setActiveTab('campaigns')} ariaLabel="stat-open-rate" />
        <MetricCard title="Click Rate" value={`${clickRate.toFixed(1)}%`} icon={MousePointer} description="Avg clicks" loading={metricsLoading} onClick={()=>setActiveTab('campaigns')} ariaLabel="stat-click-rate" />
        <MetricCard title="Unsub Rate" value={`${unsubRate.toFixed(2)}%`} icon={Users} description="Avg unsub" loading={metricsLoading} onClick={()=>setActiveTab('subscribers')} ariaLabel="stat-unsub-rate" />
        <MetricCard title="Subs" value={subscriberStats?.total || subscriberStats?.totalSubscribers || 0} icon={Users} description="Total" loading={!subscriberStats} onClick={()=>setActiveTab('subscribers')} ariaLabel="stat-subs" />
      </div>
      <div className="mt-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4" aria-label="performance-trends">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Performance Trends (30d)</h3>
        <PerformanceTrendsChart trendData={trendData} />
      </div>
      <div className="mt-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4" aria-label="engagement-funnel">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Engagement Funnel (30d)</h3>
        {funnelLoading && <div className="space-y-2" aria-live="polite">{Array.from({length:5}).map((_,i)=><div key={i} className="h-5 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />)}</div>}
        {!funnelLoading && funnelData && <EngagementFunnel stages={funnelData.stages} />}
        {!funnelLoading && !funnelData && <p className="text-xs text-gray-500" aria-live="polite">No funnel data.</p>}
      </div>
    </div>
  );
}

function PerformanceTrendsChart({ trendData }) {
  const { open = [], click = [], unsub = [] } = trendData;
  const maxLength = Math.max(open.length, click.length, unsub.length);
  
  if (!maxLength) {
    return <div className="text-xs text-gray-500">No trend data available.</div>;
  }

  // Normalize data to same length
  const normalizeData = (data, length) => {
    if (data.length === length) return data;
    if (data.length > length) return data.slice(-length);
    return [...Array(length - data.length).fill(0), ...data];
  };

  const openData = normalizeData(open, maxLength);
  const clickData = normalizeData(click, maxLength);
  const unsubData = normalizeData(unsub, maxLength);

  // Calculate scales
  const allValues = [...openData, ...clickData, ...unsubData];
  const maxValue = Math.max(...allValues, 1);
  const minValue = Math.min(...allValues, 0);

  // Create SVG paths
  const createPath = (data, color) => {
    if (!data.length) return '';
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = maxValue === minValue ? 50 : 100 - ((d - minValue) / (maxValue - minValue)) * 100;
      return `${x},${y}`;
    }).join(' ');
    return points;
  };

  const openPath = createPath(openData, '#DC2626');
  const clickPath = createPath(clickData, '#2563EB');
  const unsubPath = createPath(unsubData, '#6B7280');

  return (
    <div className="space-y-2">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-32" aria-label="performance-trends-chart">
        {openPath && (
          <polyline 
            fill="none" 
            stroke="#DC2626" 
            strokeWidth="2" 
            strokeLinejoin="round" 
            strokeLinecap="round" 
            points={openPath} 
          />
        )}
        {clickPath && (
          <polyline 
            fill="none" 
            stroke="#2563EB" 
            strokeWidth="2" 
            strokeLinejoin="round" 
            strokeLinecap="round" 
            points={clickPath} 
          />
        )}
        {unsubPath && (
          <polyline 
            fill="none" 
            stroke="#6B7280" 
            strokeWidth="2" 
            strokeLinejoin="round" 
            strokeLinecap="round" 
            points={unsubPath} 
          />
        )}
      </svg>
      <div className="flex justify-center space-x-6 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-0.5 bg-red-600"></div>
          <span>Open Rate</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-0.5 bg-blue-600"></div>
          <span>Click Rate</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-0.5 bg-gray-500"></div>
          <span>Unsub Rate</span>
        </div>
      </div>
    </div>
  );
}
