import React from 'react';

export function FormField({ id, label, required, description, error, children }) {
  const descId = description ? `${id}-desc` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [descId, errId].filter(Boolean).join(' ') || undefined;
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}
      {description && <p id={descId} className="text-xs text-gray-500 dark:text-gray-400">{description}</p>}
      {React.isValidElement(children)
        ? React.cloneElement(children, { id, 'aria-describedby': describedBy, 'aria-invalid': !!error || undefined })
        : children}
      {error && <p id={errId} role="alert" className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

export default FormField;
