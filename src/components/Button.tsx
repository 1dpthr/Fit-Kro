import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '',
  disabled,
  loading = false,
  icon,
  iconPosition = 'left',
  type = 'button',
  ...props 
}: ButtonProps) {
  const baseStyles = [
    'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
    'relative overflow-hidden text-center whitespace-nowrap',
    'hover:shadow-lg active:scale-[0.98] transform-gpu',
    'leading-none'
  ].join(' ');
  
  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: '#0EA5E9',
          color: '#FFFFFF',
          border: 'none'
        };
      case 'secondary':
        return {
          backgroundColor: '#FFFFFF',
          color: '#0F172A',
          border: '2px solid #e2e8f0'
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: '#0F172A',
          border: '2px solid #e2e8f0'
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: '#64748B',
          border: 'none'
        };
      case 'destructive':
        return {
          backgroundColor: '#ef4444',
          color: '#FFFFFF',
          border: 'none'
        };
      default:
        return {
          backgroundColor: '#0EA5E9',
          color: '#FFFFFF',
          border: 'none'
        };
    }
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm min-h-[36px] rounded-lg leading-tight',
    md: 'px-6 py-3 text-sm min-h-[44px] rounded-xl leading-tight',
    lg: 'px-8 py-4 text-base min-h-[52px] rounded-xl leading-tight',
    xl: 'px-10 py-5 text-lg min-h-[60px] rounded-2xl leading-tight'
  };
  
  const LoadingSpinner = () => (
    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
  );
  
  const IconWrapper = ({ children: child }: { children: React.ReactNode }) => (
    <span className="flex-shrink-0">{child}</span>
  );
  
  return (
    <button
      type={type}
      className={[
        baseStyles,
        sizes[size],
        className
      ].join(' ')}
      style={{
        ...getVariantStyles(variant),
        ...(props.style || {})
      }}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-disabled={disabled || loading ? true : undefined}
      {...props}
    >
      {loading ? (
        <>
          <IconWrapper>
            <LoadingSpinner />
          </IconWrapper>
          {children && <span className="leading-none">{children}</span>}
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <IconWrapper>{icon}</IconWrapper>
          )}
          {children && <span className="leading-none">{children}</span>}
          {icon && iconPosition === 'right' && (
            <IconWrapper>{icon}</IconWrapper>
          )}
        </>
      )}
    </button>
  );
}
