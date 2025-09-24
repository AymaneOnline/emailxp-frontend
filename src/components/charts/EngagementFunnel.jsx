import React from 'react';

const barColors = ['#6366F1','#4F46E5','#0EA5E9','#06B6D4','#10B981'];

export default function EngagementFunnel({ stages }) {
  if(!stages || !stages.length) return null;
  const max = Math.max(...stages.map(s=>s.value||0));
  return (
    <div className="space-y-4" aria-label="Engagement funnel" role="group">
      {stages.map((s,idx)=>{
        const ratio = max ? (s.value||0)/max : 0;
        return (
          <div key={s.key} className="flex items-center space-x-3">
            <div className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300">{s.label}</div>
            <div className="flex-1 h-5 bg-gray-200 dark:bg-gray-700 rounded relative overflow-hidden" aria-label={`${s.label} ${s.value ?? 'N/A'}`}> 
              <div className="h-full transition-all" style={{width: `${(ratio*100).toFixed(2)}%`, backgroundColor: barColors[idx%barColors.length]}} />
            </div>
            <div className="w-24 text-right text-sm tabular-nums text-gray-800 dark:text-gray-100">{s.value ?? '—'}</div>
            {idx>0 && s.percentOfPrevious!=null && (
              <div className="w-20 text-xs text-gray-500 dark:text-gray-400">{s.percentOfPrevious}%</div>
            )}
            {s.key==='conversions' && s.conversionRate!=null && (
              <div className="ml-2 px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-200 text-xs font-medium" aria-label={`Conversion rate ${s.conversionRate}%`}>
                {s.conversionRate}% CR
              </div>
            )}
          </div>
        );
      })}
      <div className="sr-only" aria-live="polite">
        {stages.map(s=>`${s.label}: ${s.value ?? 'N/A'}`).join(', ')}
      </div>
    </div>
  );
}
