// emailxp/frontend/src/components/layout/PageContainer.js
import React from 'react';

/**
 * Provides consistent internal page padding (24px = p-6) and optional max-width constraint.
 * Props:
 *  - fluid: if false, constrains width to max-w-7xl.
 *  - padded: toggle all-around padding (defaults to true). When false, no internal padding.
 */
export default function PageContainer({ children, className = '', fluid = true, padded = true }) {
  const base = [];
  base.push('w-full');
  base.push('mx-auto');
  // Uniform 24px padding (Tailwind p-6) with a slight reduction on very small screens (p-4)
  if (padded) base.push('p-4 sm:p-6');
  if (!fluid) base.push('max-w-7xl');
  return <div className={`${base.join(' ')} ${className}`.trim()}>{children}</div>;
}
