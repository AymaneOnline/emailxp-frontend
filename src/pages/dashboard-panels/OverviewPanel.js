import React, { useMemo } from 'react';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { Mail, Users, MousePointer, Eye } from 'lucide-react';
import { Sparkline } from './charts';
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
      sentCampaignsCount: o.sentCampaignsCount || 0,
    };
  }, [overview]);
  const trendData = useCampaignTrends(quickStats);
  const { data: funnelData, isLoading: funnelLoading } = useEngagementFunnel('30d');

  // Show 6-up layout only on very large (2xl) screens to avoid cramped cards at common laptop widths (~1366px)
  if (metricsLoading) return <div aria-label="overview-loading" aria-live="polite" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4 animate-pulse">{Array.from({length:6}).map((_,i)=><div key={i} className="h-32 rounded-xl bg-gray-100 dark:bg-gray-800" />)}</div>;
  if (!overview) return <p className="text-sm text-gray-500" aria-live="polite">No data yet.</p>;

  const { sent, delivered, openRate, clickRate, unsubRate, sentCampaignsCount } = metrics;

  return (
    <div className="space-y-4" aria-label="overview-panel">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4">
        {sent > 0 && (
          <MetricCard title="Sent" value={sent} icon={Mail} description="Emails" loading={metricsLoading} onClick={()=>setActiveTab('campaigns')} ariaLabel="stat-sent" />
        )}
        <MetricCard title="Delivered" value={delivered} icon={Mail} description="Successful" loading={metricsLoading} onClick={()=>setActiveTab('campaigns')} ariaLabel="stat-delivered" />
        <MetricCard title="Open Rate" value={`${openRate.toFixed(1)}%`} icon={Eye} description="Avg opens" loading={metricsLoading} onClick={()=>setActiveTab('campaigns')} ariaLabel="stat-open-rate" />
        <MetricCard title="Click Rate" value={`${clickRate.toFixed(1)}%`} icon={MousePointer} description="Avg clicks" loading={metricsLoading} onClick={()=>setActiveTab('campaigns')} ariaLabel="stat-click-rate" />
  <MetricCard title="Unsub Rate" value={`${unsubRate.toFixed(2)}%`} icon={Users} description="Avg unsub" loading={metricsLoading} onClick={()=>setActiveTab('subscribers')} ariaLabel="stat-unsub-rate" />
  <MetricCard title="Sent Campaigns" value={sentCampaignsCount} icon={Mail} description="Sent" loading={metricsLoading} onClick={()=>setActiveTab('campaigns')} ariaLabel="stat-sent-campaigns" />
  <MetricCard title="Subs" value={subscriberStats?.total || subscriberStats?.totalSubscribers || 0} icon={Users} description="Total" loading={!subscriberStats} onClick={()=>setActiveTab('subscribers')} ariaLabel="stat-subs" />
      </div>
      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
        <TrendCard label="Open Trend" data={trendData.open} color="#DC2626" />
        <TrendCard label="Click Trend" data={trendData.click} color="#2563EB" />
        <TrendCard label="Unsub Trend" data={trendData.unsub} color="#6B7280" />
        <TrendCard label="Delivered Trend" data={trendData.delivered} color="#16A34A" />
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

function TrendCard({ label, data, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3" aria-label={`trend-${label.toLowerCase().replace(/\s/g,'-')}`}> 
      <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <Sparkline data={data||[]} stroke={color} />
    </div>
  );
}
