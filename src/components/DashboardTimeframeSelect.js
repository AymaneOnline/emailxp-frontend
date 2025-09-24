import React from 'react';
import analyticsService from '../services/analyticsService';

export default function DashboardTimeframeSelect({ value, onChange }) {
  return (
    <div className="flex items-center gap-2" aria-label="timeframe-selector">
      <label htmlFor="dashboard-timeframe" className="sr-only">Select timeframe</label>
      <select
        id="dashboard-timeframe"
        aria-describedby="dashboard-timeframe-help"
        value={value}
        onChange={e=>onChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-red-500"
      >
        {analyticsService.getDateRangeOptions().map(opt => <option value={opt.value} key={opt.value}>{opt.label}</option>)}
      </select>
      <span id="dashboard-timeframe-help" className="sr-only">Changes the analytics aggregation window</span>
    </div>
  );
}
