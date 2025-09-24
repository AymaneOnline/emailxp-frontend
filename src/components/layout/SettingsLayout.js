// emailxp/frontend/src/components/layout/SettingsLayout.js
import React from 'react';
import PageContainer from './PageContainer';

/**
 * Generic Settings layout wrapper.
 * Provides:
 *  - Page header slot
 *  - Tabs bar (external control) or any navigation element
 *  - Main two-column grid (content + aside)
 */
export default function SettingsLayout({
  heading,
  description,
  tabsBar, // React node (tablist)
  children, // main content (left column)
  aside, // right column content
  id = 'settings-root'
}) {
  return (
    <PageContainer>
    <div id={id} className="max-w-7xl mx-auto space-y-6">
      <header className="space-y-2">
        {heading && (
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{heading}</h1>
        )}
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-3xl">{description}</p>
        )}
      </header>
      {tabsBar}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6" id="settings-main-column">
          {children}
        </div>
        <aside className="space-y-6 lg:sticky lg:top-4 h-fit" aria-label="settings-aside">
          {aside}
        </aside>
      </div>
    </div>
    </PageContainer>
  );
}
