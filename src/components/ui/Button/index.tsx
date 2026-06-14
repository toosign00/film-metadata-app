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
    base: 'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 px-5 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset',
    primary: 'rounded-full bg-primary text-primary-foreground hover:bg-primary-hover',
    secondary:
      'rounded-[10px] border border-border bg-surface text-foreground-secondary hover:bg-surface-alt hover:text-foreground',
    text: 'rounded-[10px] px-3 text-foreground-muted hover:bg-surface-alt hover:text-foreground',
    destructive:
      'rounded-[10px] bg-destructive text-destructive-foreground hover:bg-destructive-hover',
    disabled: 'pointer-events-none cursor-not-allowed opacity-40',
    loading: 'cursor-wait',
  };

  const buttonClasses = `
    ${styles.base}
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
        <>
          <LoaderCircle aria-hidden='true' className='animate-spin' size={20} />
          {typeof children === 'string' ? '처리하고 있어요...' : children}
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
};
