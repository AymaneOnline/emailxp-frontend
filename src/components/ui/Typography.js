import React from 'react';

export const H1 = ({ children, className = '', ...rest }) => (
  <h1 className={`text-3xl font-bold tracking-tight text-gray-900 dark:text-white ${className}`.trim()} {...rest}>{children}</h1>
);

export const H2 = ({ children, className = '', ...rest }) => (
  <h2 className={`text-2xl font-semibold tracking-tight text-gray-900 dark:text-white ${className}`.trim()} {...rest}>{children}</h2>
);

export const H3 = ({ children, className = '', ...rest }) => (
  <h3 className={`text-xl font-semibold text-gray-900 dark:text-white ${className}`.trim()} {...rest}>{children}</h3>
);

export const H4 = ({ children, className = '', ...rest }) => (
  <h4 className={`text-lg font-medium text-gray-900 dark:text-white ${className}`.trim()} {...rest}>{children}</h4>
);

export const Body = ({ children, className = '', ...rest }) => (
  <p className={`text-sm leading-relaxed text-gray-700 dark:text-gray-300 ${className}`.trim()} {...rest}>{children}</p>
);

export const Muted = ({ children, className = '', ...rest }) => (
  <p className={`text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 ${className}`.trim()} {...rest}>{children}</p>
);

export const Small = ({ children, className = '', ...rest }) => (
  <p className={`text-xs text-gray-500 dark:text-gray-400 ${className}`.trim()} {...rest}>{children}</p>
);
