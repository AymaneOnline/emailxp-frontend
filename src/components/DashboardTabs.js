import React from 'react';

export function DashboardTabs({ tabs, active, onChange }) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
      <nav className="flex flex-wrap gap-2 -mb-px" aria-label="Dashboard sections">
        {tabs.map(t => {
          const isActive = t.key === active;
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              className={`relative px-4 py-2 text-sm font-medium rounded-t-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 dark:focus-visible:ring-offset-gray-900 transition ${isActive ? 'bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 border border-b-transparent border-gray-200 dark:border-gray-700' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'} `}
              aria-current={isActive ? 'page' : undefined}
            >
              {t.label}
              {t.badge !== undefined && (
                <span className="ml-2 inline-block min-w-[1.25rem] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-[10px] font-semibold text-gray-600 dark:text-gray-300 align-middle tabular-nums">{t.badge}</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default DashboardTabs;
