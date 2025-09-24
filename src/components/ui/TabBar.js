import React from 'react';
import clsx from 'clsx';

/**
 * Unified horizontal tab bar.
 * Props:
 *  - tabs: [{ key, label, icon?: ReactComponent }]
 *  - active: current key
 *  - onChange: (key) => void
 *  - size: 'sm' | 'md'
 *  - align: 'left' | 'center'
 *  - flush: boolean (if true removes outer bottom border spacing wrapper)
 *  - className: additional classes
 */
export default function TabBar({
  tabs = [],
  active,
  onChange,
  size = 'md',
  align = 'left',
  flush = false,
  className = ''
}) {
  const baseBtn = 'relative border-b-2 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-red/40';
  const sizeCls = size === 'sm' ? 'py-2 px-2 text-xs' : 'py-2 px-3 text-sm';
  const containerAlign = align === 'center' ? 'justify-center' : 'justify-start';

  return (
    <div className={clsx(flush ? '' : 'border-b border-gray-200 dark:border-gray-700', className)}>
      <nav className={clsx('flex gap-6 -mb-px', containerAlign)} aria-label="Section tabs">
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = t.key === active;
          return (
            <button
              key={t.key}
              onClick={() => onChange && onChange(t.key)}
              className={clsx(baseBtn, sizeCls, isActive
                ? 'border-primary-red text-primary-red dark:text-primary-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200')}
              type="button"
              role="tab"
              aria-selected={isActive}
            >
              {Icon && <Icon className={clsx('w-4 h-4 mr-2 inline-block align-text-bottom', size==='sm' && 'w-3 h-3')} />}
              {t.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
