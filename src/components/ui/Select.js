// emailxp/frontend/src/components/ui/Select.js

import React, { useState, useRef, useEffect } from 'react';

const Select = ({ 
  children, 
  value, 
  onValueChange, 
  className = '', 
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleToggle = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <div 
      ref={selectRef}
      className={`relative ${className}`}
      {...props}
    >
      {React.Children.map(children, child => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, {
            onClick: handleToggle,
            'aria-expanded': isOpen
          });
        }
        if (child.type === SelectContent) {
          return React.cloneElement(child, {
            isOpen,
            onClose: () => setIsOpen(false),
            value,
            onValueChange
          });
        }
        return child;
      })}
    </div>
  );
};

const SelectTrigger = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  const baseClasses = 'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  
  const combinedClasses = `${baseClasses} ${className}`;
  
  return (
    <button
      type="button"
      className={combinedClasses}
      {...props}
    >
      {children}
      <span className="ml-2">▼</span>
    </button>
  );
};

const SelectContent = ({ 
  children, 
  isOpen, 
  onClose, 
  value, 
  onValueChange,
  className = '', 
  ...props 
}) => {
  if (!isOpen) return null;
  
  const baseClasses = 'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2';
  
  const combinedClasses = `${baseClasses} ${className}`;
  
  // Handle item selection
  const handleSelect = (itemValue) => {
    onValueChange(itemValue);
    onClose();
  };
  
  return (
    <div
      className={combinedClasses}
      {...props}
    >
      <div className="p-1">
        {React.Children.map(children, child => {
          if (child.type === SelectItem) {
            return React.cloneElement(child, {
              isSelected: child.props.value === value,
              onSelect: () => handleSelect(child.props.value)
            });
          }
          return child;
        })}
      </div>
    </div>
  );
};

const SelectItem = ({ 
  children, 
  value, 
  isSelected, 
  onSelect,
  className = '', 
  ...props 
}) => {
  const baseClasses = 'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 dark:focus:bg-gray-700 data-[disabled]:pointer-events-none data-[disabled]:opacity-50';
  
  const combinedClasses = `${baseClasses} ${isSelected ? 'bg-gray-100 dark:bg-gray-700' : ''} ${className}`;
  
  return (
    <div
      role="option"
      aria-selected={isSelected}
      className={combinedClasses}
      onClick={onSelect}
      {...props}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <span className="h-2 w-2 bg-red-600 rounded-full"></span>
        </span>
      )}
      <span>{children}</span>
    </div>
  );
};

const SelectValue = ({ placeholder, ...props }) => {
  return (
    <span {...props}>
      {props.value || placeholder}
    </span>
  );
};

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };