import { LoaderCircle } from 'lucide-react';
import type { ButtonProps } from '@/types/button.types';

export const Button = ({
  variant = 'primary',
  isLoading = false,
  disabled = false,
  onClick,
  type = 'button',
  icon,
  className = '',
  children,
  ...rest
}: ButtonProps) => {
  const styles = {
    base: 'cursor-pointer px-3 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring focus:ring-offset-ring-offset transition-all',
    primary: 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-md',
    secondary: 'bg-muted text-foreground hover:bg-border-hover shadow-md',
    outlined:
      'bg-transparent border border-border-hover text-foreground-secondary hover:bg-surface focus:ring-ring',
    text: 'bg-transparent text-foreground-secondary hover:text-foreground hover:bg-surface focus:ring-ring',
    disabled: 'opacity-50 cursor-not-allowed pointer-events-none',
    loading: 'cursor-wait',
  };

  const buttonClasses = `
    ${styles.base}
    ${styles[variant]}
    ${disabled ? styles.disabled : ''}
    ${isLoading ? styles.loading : ''}
    ${className}
  `;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={buttonClasses}
      {...rest}
    >
      {isLoading ? (
        <div className='flex items-center justify-center'>
          <LoaderCircle className='mr-2 animate-spin text-current' size={20} />
          <span>{typeof children === 'string' ? '처리 중...' : children}</span>
        </div>
      ) : (
        <div className='flex items-center justify-center'>
          {icon && <span className='mr-2'>{icon}</span>}
          {children}
        </div>
      )}
    </button>
  );
};
