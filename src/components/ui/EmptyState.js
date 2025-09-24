import React from 'react';
import { Button } from './Button';

export function EmptyState({
  icon: Icon,
  title = 'Nothing here yet',
  description = 'There is no data to display.',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  children
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-10 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800">
      {Icon && <Icon className="w-12 h-12 text-gray-400 mb-4" />}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mb-6">{description}</p>
      <div className="flex flex-wrap gap-3 justify-center">
        {actionLabel && (
          <Button onClick={onAction} variant="primary" size="md">{actionLabel}</Button>
        )}
        {secondaryActionLabel && (
          <Button onClick={onSecondaryAction} variant="secondary" size="md">{secondaryActionLabel}</Button>
        )}
      </div>
      {children && <div className="mt-6 w-full max-w-xl">{children}</div>}
    </div>
  );
}

export default EmptyState;
