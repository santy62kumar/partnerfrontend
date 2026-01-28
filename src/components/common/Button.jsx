import React from 'react';

/**
 * Reusable Button Component
 * @param {string} variant - Button style variant (primary, secondary, danger, outline)
 * @param {string} size - Button size (sm, md, lg)
 * @param {boolean} loading - Show loading state
 * @param {boolean} disabled - Disable button
 * @param {string} className - Additional CSS classes
 * @param {React.ReactNode} children - Button content
 * @param {Function} onClick - Click handler
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  children,
  type = 'button',
  onClick,
  ...props
}) => {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    
    primary: 'bg-[#3D1D1C] text-white hover:bg-[#4A2624] focus:ring-[#3D1D1C]',
    // secondary: 'bg-primary-grey-600 text-white hover:bg-primary-grey-700 focus:ring-primary-grey-500',
    secondary: 'bg-[#3D1D1C]/90 text-white hover:bg-[#3D1D1C] focus:ring-[#3D1D1C]',
    danger: 'bg-primary-red text-white hover:bg-red-600 focus:ring-primary-red',
    outline: 'border-2 border-[#3D1D1C] text-[#3D1D1C] hover:bg-[#3D1D1C] hover:text-white focus:ring-[#3D1D1C]',
    ghost: 'text-primary-grey-700 hover:bg-primary-grey-100 focus:ring-primary-grey-400',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className} flex items-center justify-center gap-2`}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;