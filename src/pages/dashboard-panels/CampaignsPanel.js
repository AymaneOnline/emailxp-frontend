import React, { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { MiniBarChart } from './charts';
import StatusBadge from '../../components/ui/StatusBadge';
import { MetricCard } from '../../components/dashboard/MetricCard';

export default function CampaignsPanel({ overview, topCampaigns = [], recentActivity = [], metricsLoading, navigate, setActiveTab }) {
  // Move hooks before any early returns
  const computed = useMemo(()=>{
    const sent = overview?.totalSent || 0;
    const delivered = overview?.totalDelivered || 0;
    const openRate = overview?.openRate || 0;
    const clickRate = overview?.clickRate || 0;
    const deliveryRate = sent ? (delivered / sent * 100).toFixed(1) : '0.0';
    return { sent, delivered, openRate, clickRate, deliveryRate };
  }, [overview]);
  const barData = useMemo(() => topCampaigns.slice(0,8).map(c => ({ label: c.subject?.slice(0,8)||'–', value: c.openRate || 0 })), [topCampaigns]);
  const topFive = useMemo(() => topCampaigns.slice(0,5), [topCampaigns]);
  const recentFive = useMemo(() => recentActivity.slice(0,5), [recentActivity]);

  if (metricsLoading) return <PanelSkeleton />;
  const { sent, delivered, openRate, clickRate, deliveryRate } = computed;

  return (
    <div className="space-y-4" aria-label="campaigns-panel">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Sent" value={sent} ariaLabel="metric-sent" />
        <MetricCard title="Delivered" value={delivered} ariaLabel="metric-delivered" />
        <MetricCard title="Open Rate" value={openRate.toFixed(1)+"%"} ariaLabel="metric-open-rate" />
        <MetricCard title="Click Rate" value={clickRate.toFixed(1)+"%"} ariaLabel="metric-click-rate" />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4" aria-label="panel-performance-insights">
            <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Performance Insights</h3>
            <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
              <li>Delivery Rate: <span className="font-medium text-gray-900 dark:text-white">{deliveryRate}%</span></li>
              <li>Open Rate: <span className="font-medium text-gray-900 dark:text-white">{openRate.toFixed(1)}%</span></li>
              <li>Click Rate: <span className="font-medium text-gray-900 dark:text-white">{clickRate.toFixed(1)}%</span></li>
              <li>Recent Activity Events: <span className="font-medium text-gray-900 dark:text-white">{recentActivity.length}</span></li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4" aria-label="panel-top-campaigns">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Top Campaigns</h3>
              <button aria-label="view-all-campaigns" onClick={()=>navigate('/campaigns')} className="text-xs inline-flex items-center gap-1 text-red-600 dark:text-red-400 hover:underline">View All <ArrowRight className="w-3 h-3" /></button>
            </div>
            {topCampaigns.length === 0 ? <p className="text-xs text-gray-500">No campaign data yet.</p> : (
              <>
                <MiniBarChart data={barData} />
                <ul className="divide-y divide-gray-100 dark:divide-gray-700 mt-4" aria-label="top-campaigns-list">
                  {topFive.map((c,i)=>(
                    <li key={c._id||i} className="py-2 flex items-center justify-between gap-2 text-xs" aria-label={`campaign-${i}`}>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 dark:text-gray-100 truncate">{c.subject || 'Untitled Campaign'}</p>
                        <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                          <span>{c.openRate?.toFixed(1) || '0.0'}% open</span>
                          <span>{c.clickRate?.toFixed(1) || '0.0'}% click</span>
                          {c.status && <StatusBadge status={c.status} size="sm" />}
                        </div>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <p className="font-medium text-gray-800 dark:text-gray-100">{c.delivered || c.sent || 0}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">delivered</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4" aria-label="panel-recent-activity">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
              <button aria-label="refresh-activity" onClick={()=>setActiveTab('campaigns')} className="text-xs text-red-600 dark:text-red-400 hover:underline">Refresh</button>
            </div>
            {recentActivity.length === 0 ? <p className="text-xs text-gray-500">No recent activity.</p> : (
              <ul className="space-y-3 text-xs" aria-label="activity-list">
                {recentFive.map((a,i)=>(
                  <li key={a.id || i} className="flex items-start gap-2" aria-label={`activity-${i}`}>
                    <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-red-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 dark:text-gray-100">{a.description || a.type}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">{new Date(a.timestamp || a.date || Date.now()).toLocaleString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// MetricTile replaced by shared MetricCard

function PanelSkeleton(){
  return <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="campaigns-loading" aria-live="polite">{Array.from({length:4}).map((_,i)=><div key={i} className="h-24 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />)}</div>;
}
