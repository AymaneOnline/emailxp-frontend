import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * Reusable metric display card.
 * Variants: solid (default white) | subtle (muted background)
 * Sizes: md (default) | sm (reduced padding & font)
 */
export function MetricCard({
  title,
  value,
  icon: Icon,
  delta,
  deltaLabel = 'vs prev',
  description,
  loading,
  onClick,
  size = 'md',
  variant = 'solid',
  ariaLabel
}) {
  const positive = typeof delta === 'number' && delta > 0;
  const negative = typeof delta === 'number' && delta < 0;
  const basePad = size === 'sm' ? 'p-3' : 'p-4 sm:p-5';
  const valueCls = size === 'sm' ? 'text-xl' : 'text-2xl';
  const variantCls = variant === 'subtle'
    ? 'bg-gray-50 dark:bg-gray-900/40'
    : 'bg-white dark:bg-gray-800';
  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 ${variantCls} ${basePad} flex flex-col gap-2 shadow-sm hover:shadow transition cursor-${onClick ? 'pointer' : 'default'}`}
      onClick={onClick}
      aria-label={ariaLabel || title}
      role={onClick ? 'button' : 'region'}
      tabIndex={onClick ? 0 : -1}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 truncate">{title}</p>
          {loading ? (
            <div className="h-7 w-24 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ) : (
            <div className={`${valueCls} font-semibold text-gray-900 dark:text-white tabular-nums truncate`}>{value}</div>
          )}
        </div>
        {Icon && (
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {(delta !== undefined || description) && (
        <div className="mt-auto flex items-center justify-between text-[11px]">
          {delta !== undefined && (
            <span className={`inline-flex items-center font-medium ${positive ? 'text-green-600 dark:text-green-400' : negative ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
              {positive && <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />}
              {negative && <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
              {Math.abs(delta).toFixed(1)}% {deltaLabel}
            </span>
          )}
          {description && (
            <span className="text-gray-500 dark:text-gray-400 truncate ml-auto">{description}</span>
          )}
        </div>
      )}
    </div>
  );
}

export function MetricSkeleton({ count = 4, size = 'md' }) {
  const basePad = size === 'sm' ? 'p-3' : 'p-4';
  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(auto-fit,minmax(${size==='sm'?140:170}px,1fr))` }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${basePad} animate-pulse space-y-3`}>
          <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-7 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      ))}
    </div>
  );
}

export default MetricCard;