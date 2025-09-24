import React from 'react';

export function Sparkline({ data = [], stroke = '#DC2626', height = 32 }) {
  if (!data.length) return <div className="h-8" />;
  const max = Math.max(...data); const min = Math.min(...data);
  const points = data.map((d,i)=>{ const x=(i/(data.length-1))*100; const y=max===min?50:((1-(d-min)/(max-min))*100); return `${x},${y}`; }).join(' ');
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full" style={{height}} aria-label="sparkline">
      <polyline fill="none" stroke={stroke} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" points={points} />
    </svg>
  );
}

export function MiniBarChart({ data = [], height = 140 }) {
  if (!data.length) return <div className="h-32" />;
  const max = Math.max(...data.map(d=>d.value||0)) || 1;
  const barW = 100 / data.length;
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full" style={{height}} aria-label="mini-bar-chart">
      {data.map((d,i)=>{ const h=(d.value||0)/max*100; const x=i*barW+barW*0.15; const w=barW*0.7; const y=100-h; return <g key={i}> <rect x={x} y={y} width={w} height={h} rx="1" className="fill-red-500/70 dark:fill-red-400/70" /> <text x={x+w/2} y={y-1} textAnchor="middle" fontSize="4" fill="currentColor">{Math.round(d.value)}</text></g>; })}
    </svg>
  );
}
