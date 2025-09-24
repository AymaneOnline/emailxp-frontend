import React, { useMemo } from 'react';
import { useDeliverabilitySummary, useDeliverabilityTrends, useDeliverabilityInsights } from '../../hooks/useDeliverability';
import StackedDeliverabilityChart from '../../components/charts/StackedDeliverabilityChart';
import { MetricCard } from '../../components/dashboard/MetricCard';

export default function DeliverabilityPanel({ days = 30 }){
  const { data: summary, isLoading: loadingSummary } = useDeliverabilitySummary(days);
  const { data: trends, isLoading: loadingTrends } = useDeliverabilityTrends(Math.min(days,14));
  const { data: insights } = useDeliverabilityInsights(days);

  const rates = useMemo(()=>{
    if(!summary) return { deliveryRate:0, hardRate:0, softRate:0, complaintRate:0 };
    const { sent=0, delivered=0, hardBounces=0, softBounces=0, complaints=0 } = summary;
    return {
      deliveryRate: sent? (delivered/sent)*100:0,
      hardRate: sent? (hardBounces/sent)*100:0,
      softRate: sent? (softBounces/sent)*100:0,
      complaintRate: sent? (complaints/sent)*100:0
    };
  },[summary]);

  return (
    <div className="space-y-6" aria-label="deliverability-panel">
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
        <MetricCard title="Delivery Rate" value={rates.deliveryRate.toFixed(2)+'%'} description="Delivered / Sent" loading={loadingSummary} />
        <MetricCard title="Hard Bounce" value={rates.hardRate.toFixed(2)+'%'} description="Hard / Sent" loading={loadingSummary} />
        <MetricCard title="Soft Bounce" value={rates.softRate.toFixed(2)+'%'} description="Soft / Sent" loading={loadingSummary} />
        <MetricCard title="Complaints" value={rates.complaintRate.toFixed(2)+'%'} description="Spam / Sent" loading={loadingSummary} />
        <MetricCard title="Sent" value={summary?.sent || 0} description="Emails Sent" loading={loadingSummary} />
        <MetricCard title="Delivered" value={summary?.delivered || 0} description="Delivered" loading={loadingSummary} />
      </div>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-2">Deliverability Composition (Last {Math.min(days,14)}d)</h3>
        <StackedDeliverabilityChart buckets={trends?.buckets||[]} />
      </div>
      {insights?.length>0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-2">Insights</h3>
          <ul className="list-disc list-inside text-xs space-y-1">
            {insights.map((i,idx)=>(<li key={idx}>{i.message || i.text || i}</li>))}
          </ul>
        </div>
      )}
    </div>
  );
}
