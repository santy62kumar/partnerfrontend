import React from 'react';
import { Card as UICard, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { cn } from '@/lib/utils';

// Same props the app already passes (title, headerRight, hoverable, padding),
// rendered by the shadcn card so every surface shares one radius, border and shadow.
const Card = ({
  children,
  title,
  headerRight,
  hoverable = false,
  onClick,
  className = '',
  padding = 'p-6',
}) => {
  const interactive = Boolean(onClick);

  return (
    <UICard
      className={cn(
        'gap-0 py-0 overflow-hidden',
        hoverable && 'transition-shadow hover:shadow-md',
        interactive && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick(event);
              }
            }
          : undefined
      }
    >
      {(title || headerRight) && (
        <CardHeader className="flex flex-row items-center justify-between gap-3 border-b px-6 py-4">
          {title && <CardTitle className="text-base font-bold">{title}</CardTitle>}
          {headerRight && <div>{headerRight}</div>}
        </CardHeader>
      )}
      <CardContent className={cn('px-0', padding)}>{children}</CardContent>
    </UICard>
  );
};

export default Card;
