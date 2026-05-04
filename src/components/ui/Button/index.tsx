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
    base: 'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset',
    primary: 'bg-foreground text-surface hover:bg-foreground/90',
    secondary: 'border border-border bg-surface text-foreground-secondary hover:bg-surface-alt',
    outlined: 'border border-border bg-transparent text-foreground-secondary hover:bg-surface-alt',
    text: 'bg-transparent text-foreground-secondary hover:bg-surface-alt hover:text-foreground',
    disabled: 'opacity-40 cursor-not-allowed pointer-events-none',
    loading: 'cursor-wait',
  };

  const buttonClasses = `
    ${styles.base}
    px-4 py-2.5 text-sm
    ${styles[variant]}
    ${disabled ? styles.disabled : ''}
    ${isLoading ? styles.loading : ''}
    ${className}
  `.trim();

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
