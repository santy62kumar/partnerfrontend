import React from 'react';

/**
 * Reusable Card Component
 * @param {React.ReactNode} children - Card content
 * @param {string} title - Optional card title
 * @param {React.ReactNode} headerRight - Content for right side of header
 * @param {boolean} hoverable - Add hover effect
 * @param {Function} onClick - Click handler for clickable cards
 * @param {string} className - Additional CSS classes
 */
const Card = ({
  children,
  title,
  headerRight,
  hoverable = false,
  onClick,
  className = '',
  padding = 'p-6',
}) => {
  const baseStyles = 'bg-white rounded-lg shadow-card transition-shadow duration-200';
  const hoverStyles = hoverable ? 'hover:shadow-card-hover cursor-pointer' : '';
  const clickableStyles = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${clickableStyles} ${className}`}
      onClick={onClick}
    >
      {(title || headerRight) && (
        <div className="flex items-center justify-between border-b border-primary-grey-200 px-6 py-4">
          {title && (
            <h3 className="text-lg font-semibold font-montserrat text-primary-grey-900">
              {title}
            </h3>
          )}
          {headerRight && <div>{headerRight}</div>}
        </div>
      )}
      
      <div className={title || headerRight ? padding : padding}>
        {children}
      </div>
    </div>
  );
};

export default Card;