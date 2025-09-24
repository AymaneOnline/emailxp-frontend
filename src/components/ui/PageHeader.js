import React from 'react';
import { H1, Body } from './Typography';

export function PageHeader({ title, description, actions, meta }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <H1 className="mb-1 md:mb-0">{title}</H1>
        {description && <Body className="mt-1 max-w-prose text-gray-600 dark:text-gray-400">{description}</Body>}
        {meta && <div className="mt-2 flex flex-wrap gap-2">{meta}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

export default PageHeader;
