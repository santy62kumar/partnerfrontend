import React, { forwardRef } from 'react';

/**
 * Reusable Input Component
 * @param {string} label - Input label
 * @param {string} error - Error message
 * @param {string} helperText - Helper text below input
 * @param {boolean} required - Mark as required
 * @param {string} className - Additional CSS classes
 */
const Input = forwardRef(
  (
    {
      label,
      type = 'text',
      error,
      helperText,
      required = false,
      disabled = false,
      className = '',
      containerClassName = '',
      leftIcon,
      rightIcon,
      ...props
    },
    ref
  ) => {
    const baseInputStyles = 'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200';
    const normalStyles = 'border-primary-grey-300 focus:border-[#3D1D1C] focus:ring-[#3D1D1C]';

    const errorStyles = 'border-primary-red focus:border-primary-red focus:ring-primary-red';
    const disabledStyles = 'bg-primary-grey-100 cursor-not-allowed';

    const inputStyles = `${baseInputStyles} ${
      error ? errorStyles : normalStyles
    } ${disabled ? disabledStyles : ''} ${leftIcon ? 'pl-10' : ''} ${
      rightIcon ? 'pr-10' : ''
    } ${className}`;

    return (
      <div className={`mb-4 ${containerClassName}`}>
        {label && (
          <label className="block text-sm font-medium text-primary-grey-700 mb-1">
            {label}
            {required && <span className="text-primary-red ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary-grey-400">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            type={type}
            disabled={disabled}
            className={inputStyles}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-grey-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1 text-sm text-primary-red">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="mt-1 text-sm text-primary-grey-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;