import React from 'react';

// Simple skeleton block. Use width/height utility classes when using.
export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-700 ${className}`}></div>
  );
}

export default Skeleton;
