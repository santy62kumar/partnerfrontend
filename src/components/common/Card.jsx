import React from 'react';

const Card = ({
  children,
  title,
  headerRight,
  hoverable = false,
  onClick,
  className = '',
  padding = 'p-6',
}) => {
  const hoverClass = hoverable ? 'ds-card-hoverable' : '';
  const clickableClass = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`ds-card ${hoverClass} ${clickableClass} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e);
              }
            }
          : undefined
      }
    >
      {(title || headerRight) && (
        <div className="ds-card-header">
          {title && <h3 className="ds-card-title">{title}</h3>}
          {headerRight && <div>{headerRight}</div>}
        </div>
      )}

      <div className={padding}>
        {children}
      </div>
    </div>
  );
};

export default Card;
