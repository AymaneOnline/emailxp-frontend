import React, { useMemo } from 'react';

// Simple SVG stacked area / bar hybrid for deliverability composition
export default function StackedDeliverabilityChart({ buckets = [], height = 140 }) {
  const series = useMemo(()=>{
    // Normalize numeric arrays
    return buckets.map(b=>({
      date: b.date,
      sent: b.sent||0,
      delivered: b.delivered||0,
      hard: b.hard || b.hardBounces || 0,
      soft: b.soft || b.softBounces || 0,
      complaints: b.complaints||0
    }));
  },[buckets]);

  if (!series.length) return <div className="text-xs text-gray-500">No deliverability data.</div>;

  const maxSent = Math.max(...series.map(d=>d.sent||0),1);
  const w = Math.max(series.length * 18, 320);
  const barWidth = Math.max(4, Math.floor((w-20)/series.length)-4);

  const colors = {
    delivered: '#16A34A',
    hard: '#DC2626',
    soft: '#F59E0B',
    complaints: '#7C3AED'
  };

  return (
    <div className="overflow-x-auto" aria-label="deliverability-trend">
      <svg width={w} height={height} role="img" aria-describedby="deliverability-desc">
        <desc id="deliverability-desc">Stacked bars showing composition of delivery outcomes per day.</desc>
        {series.map((d,i)=>{
          const x = 10 + i*(barWidth+4);
          let yCursor = height - 20;
          const segments = [
            { key:'complaints', value:d.complaints },
            { key:'soft', value:d.soft },
            { key:'hard', value:d.hard },
            { key:'delivered', value:d.delivered }
          ];
          return segments.map(seg=>{
            const h = (d.sent ? (seg.value / maxSent) * (height-40) : 0);
            const y = yCursor - h;
            yCursor = y;
            return <rect key={seg.key+ i} x={x} y={y} width={barWidth} height={h} fill={colors[seg.key]} rx={1} />;
          });
        })}
        {/* Axis baseline */}
        <line x1={0} x2={w} y1={height-20} y2={height-20} stroke="#e5e7eb" />
      </svg>
      <Legend colors={colors} />
    </div>
  );
}

function Legend({ colors }){
  const items = [
    ['delivered','Delivered'],
    ['hard','Hard'],
    ['soft','Soft'],
    ['complaints','Complaints']
  ];
  return (
    <div className="flex flex-wrap gap-3 mt-2 text-[11px]">
      {items.map(([k,label])=> (
        <span key={k} className="inline-flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm" style={{background:colors[k]}} /> {label}
        </span>
      ))}
    </div>
  );
}
