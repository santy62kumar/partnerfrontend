import React, { forwardRef } from 'react';

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
    const inputId = props.id || props.name;
    const errorId = inputId ? `${inputId}-error` : undefined;
    const helperTextId = inputId ? `${inputId}-helper` : undefined;
    const errorClass = error ? 'ds-input-error' : '';
    const paddingLeft = leftIcon ? 'pl-10' : '';
    const paddingRight = rightIcon ? 'pr-10' : '';
    const describedBy = [error ? errorId : null, helperText && !error ? helperTextId : null]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <div className={`mb-4 ${containerClassName}`}>
        {label && (
          <label htmlFor={inputId} className="ds-label">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            >
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            className={`ds-input ${errorClass} ${paddingLeft} ${paddingRight} ${className}`}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            {...props}
          />

          {rightIcon && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            >
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p id={errorId} className="mt-1 text-sm text-destructive">{error}</p>
        )}

        {helperText && !error && (
          <p id={helperTextId} className="mt-1 text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
