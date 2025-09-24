// emailxp/frontend/src/components/ui/Progress.js

import React from 'react';

const Progress = ({ 
  value, 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'relative h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700';
  
  const combinedClasses = `${baseClasses} ${className}`;
  
  const progressWidth = value ? `${Math.min(100, Math.max(0, value))}%` : '0%';
  
  return (
    <div 
      className={combinedClasses}
      {...props}
    >
      <div 
        className="h-full w-full flex-1 bg-red-600 transition-all duration-300 ease-in-out"
        style={{ width: progressWidth }}
      />
    </div>
  );
};

export { Progress };