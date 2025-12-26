import React, { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  id?: string;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export function Input({ 
  label, 
  error, 
  helperText,
  className = '', 
  id, 
  variant = 'default',
  size = 'md',
  leftIcon,
  rightIcon,
  showPasswordToggle = false,
  type,
  ...props 
}: InputProps) {
  const autoId = useId();
  const inputId = id || `input-${autoId}`;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const actualType = isPassword && showPassword ? 'text' : type;

  const baseStyles = [
    'w-full transition-all duration-200',
    'focus:outline-none focus:ring-4 focus:ring-primary-500/20',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-secondary',
    'placeholder:text-muted',
    'transform-gpu text-primary',
    'leading-none'
  ].join(' ');

  const variants = {
    default: [
      'bg-white border-2 border-default rounded-xl',
      'hover:border-slate-300',
      'focus:border-primary-500',
      error ? 'border-error-500 focus:border-error-500 focus:ring-error-500/20' : ''
    ].join(' '),
    
    filled: [
      'bg-surface-secondary border-0 rounded-xl',
      'hover:bg-surface-secondary/80',
      'focus:bg-white focus:border-2 focus:border-primary-500',
      'focus:shadow-lg',
      error ? 'bg-error-50 focus:bg-error-50 focus:border-error-500' : ''
    ].join(' '),
    
    outlined: [
      'bg-transparent border-2 border-default rounded-xl',
      'hover:border-slate-300',
      'focus:border-primary-500',
      'shadow-sm hover:shadow-md',
      error ? 'border-error-500 focus:border-error-500' : ''
    ].join(' ')
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm min-h-[36px] leading-tight',
    md: 'px-4 py-3 text-sm min-h-[44px] leading-tight',
    lg: 'px-5 py-4 text-base min-h-[52px] leading-tight'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const paddingWithIcons = leftIcon ? 'pl-10' : '';
  const paddingWithRightIcon = rightIcon || (isPassword && showPasswordToggle) ? 'pr-10' : '';

  return (
    <div className="w-full space-y-2">
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-slate-700 leading-none"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted">
            {React.cloneElement(leftIcon as React.ReactElement<any>, { 
              className: iconSizes[size] 
            })}
          </div>
        )}
        
        <input
          id={inputId}
          type={actualType}
          aria-invalid={!!error}
          aria-describedby={[
            error ? errorId : '',
            helperText ? helperId : ''
          ].filter(Boolean).join(' ') || undefined}
          className={[
            baseStyles,
            variants[variant],
            sizes[size],
            paddingWithIcons,
            paddingWithRightIcon,
            className
          ].join(' ')}
          {...props}
        />
        
        {isPassword && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-primary transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className={iconSizes[size]} />
            ) : (
              <Eye className={iconSizes[size]} />
            )}
          </button>
        )}
        
        {rightIcon && !isPassword && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted">
            {React.cloneElement(rightIcon as React.ReactElement<any>, { 
              className: iconSizes[size] 
            })}
          </div>
        )}
      </div>
      
      {error && (
        <p 
          id={errorId} 
          role="alert" 
          className="text-red-600 text-sm font-medium leading-tight"
        >
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p 
          id={helperId} 
          className="text-secondary text-sm leading-tight"
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
