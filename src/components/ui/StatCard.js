import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function StatCard({ title, value, prefix, suffix, delta, deltaLabel = 'vs prev', icon: Icon, loading, description, onClick }) {
  const positive = delta !== undefined && delta > 0;
  const negative = delta !== undefined && delta < 0;
  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 sm:p-5 flex flex-col gap-2 shadow-sm hover:shadow transition cursor-${onClick ? 'pointer' : 'default'}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{title}</p>
          {loading ? (
            <div className="h-7 w-24 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ) : (
            <div className="text-2xl font-semibold text-gray-900 dark:text-white tabular-nums">
              {prefix}{value}{suffix}
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {(delta !== undefined || description) && (
        <div className="mt-auto flex items-center justify-between text-xs">
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

export default StatCard;
