// emailxp/frontend/src/components/ui/Badge.js

import React from 'react';

const Badge = ({ 
  children, 
  variant = 'default', 
  className = '', 
  ...props 
}) => {
  // Define base classes
  let baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';
  
  // Define variant classes
  const variantClasses = {
    default: 'bg-red-600 text-white hover:bg-red-700',
    secondary: 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600',
    destructive: 'bg-red-500 text-white hover:bg-red-600',
    outline: 'border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'
  };
  
  // Combine all classes
  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;
  
  return (
    <div 
      className={combinedClasses}
      {...props}
    >
      {children}
    </div>
  );
};

export { Badge };