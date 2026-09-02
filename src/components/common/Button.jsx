import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button as UIButton } from '@components/ui/button';

// Kept as the app's older Button API (variant="primary", size="md", loading, fullWidth)
// but rendered by the shadcn button, so both kits produce one visual language.
const VARIANTS = {
  primary: 'default',
  secondary: 'secondary',
  danger: 'destructive',
  outline: 'outline',
  ghost: 'ghost',
};

const SIZES = { sm: 'sm', md: 'default', lg: 'lg' };

const Button = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingLabel = 'Loading…',
  disabled = false,
  fullWidth = false,
  className = '',
  children,
  type = 'button',
  ...props
}) => (
  <UIButton
    type={type}
    variant={VARIANTS[variant] || 'default'}
    size={SIZES[size] || 'default'}
    disabled={disabled || loading}
    className={`${fullWidth ? 'w-full' : ''} ${className}`}
    {...props}
  >
    {loading ? (
      <>
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        <span>{loadingLabel}</span>
      </>
    ) : (
      children
    )}
  </UIButton>
);

export default Button;
