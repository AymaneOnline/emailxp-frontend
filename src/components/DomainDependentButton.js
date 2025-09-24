import React from 'react';
import { useSelector } from 'react-redux';

export default function DomainDependentButton({ onClick, children, disabled, reason = 'send emails', className = '', ...rest }) {
  const { user } = useSelector(s => s.auth);
  const hasDomain = !!user?.hasVerifiedDomain;
  const isDisabled = disabled || !hasDomain;
  const tooltip = !hasDomain ? `Need verified domain to ${reason}.` : undefined;
  return (
    <button
      {...rest}
      onClick={e => { if (isDisabled) { e.preventDefault(); return; } onClick && onClick(e); }}
      disabled={isDisabled}
      title={tooltip}
      className={`${className} ${!hasDomain ? 'opacity-60 cursor-not-allowed relative' : ''}`}
      aria-disabled={isDisabled}
    >
      {children}
    </button>
  );
}