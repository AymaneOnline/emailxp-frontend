import React from 'react';
import useListHealth from '../../hooks/useListHealth';

function ScoreBadge({ score }){
  let color = 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
  if(score < 60) color = 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
  else if(score < 80) color = 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
  return <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${color}`}>{score}%</span>;
}

export default function ListHealthPanel({ days=30 }){
  const { data, isLoading, error } = useListHealth(days);
  if(isLoading) return <div className="p-4 animate-pulse text-sm text-gray-500">Loading list health…</div>;
  if(error) return <div className="p-4 text-sm text-red-600">Failed to load list health</div>;
  if(!data) return null;

  const counts = data.counts || {};
  const total = Object.values(counts).reduce((a,b)=>a+b,0);
  const churn = (counts.unsubscribed||0)+(counts.bounced||0)+(counts.complained||0);
  const churnRate = total? ((churn/total)*100).toFixed(2): null;

  const inactivity = data.inactivityBuckets || {};
  const inactivityOrder = ['0-30','31-60','61-90','91-180','>180'];

  function recommendationLines(){
    const recs = [];
    if(churnRate && churnRate>5) recs.push('Elevated churn (>5%) – audit recent campaigns');
    if(inactivity['>180']>0) recs.push('Large dormant segment >180d – consider a re-engagement sequence');
    if((counts.bounced||0)/total > 0.03) recs.push('Bounce rate high – validate acquisition sources & hygiene');
    if(!recs.length) recs.push('List health stable – maintain send cadence & segmentation.');
    return recs;
  }

  return (
    <div className="space-y-6" aria-label="List health analytics">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">List Health</h3>
        <ScoreBadge score={data.healthScore} />
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h4 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Growth (Net)</h4>
          <p className="text-2xl font-semibold">{data.growth.net}</p>
          <p className="text-xs text-gray-500 mt-1">New {data.growth.new} | Unsub {data.growth.unsubscribed}</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h4 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Churn Rate</h4>
          <p className="text-2xl font-semibold">{churnRate ?? '—'}%</p>
          <p className="text-xs text-gray-500 mt-1">Unsub + Bounce + Complaints</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h4 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Quality</h4>
          <p className="text-sm">Bounced: {counts.bounced||0}</p>
          <p className="text-sm">Complaints: {counts.complained||0}</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h4 className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Health Score</h4>
          <p className="text-2xl font-semibold">{data.healthScore}</p>
          <p className="text-xs text-gray-500 mt-1">Higher is better</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Inactivity Distribution</h4>
        <div className="space-y-2">
          {inactivityOrder.map(bucket=>{
            const val = inactivity[bucket]||0;
            const pct = total? (val/total)*100:0;
            return (
              <div key={bucket} className="flex items-center space-x-3">
                <div className="w-20 text-xs text-gray-600 dark:text-gray-400">{bucket}d</div>
                <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                  <div className="h-full bg-indigo-500 dark:bg-indigo-400" style={{width:`${pct.toFixed(2)}%`}} />
                </div>
                <div className="w-14 text-right text-xs tabular-nums text-gray-700 dark:text-gray-300">{val}</div>
                <div className="w-12 text-right text-xs text-gray-500">{pct.toFixed(1)}%</div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Recommendations</h4>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
          {recommendationLines().map((r,i)=>(<li key={i}>{r}</li>))}
        </ul>
      </div>
    </div>
  );
}
