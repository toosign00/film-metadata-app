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
  // 버튼 스타일 변형
  const styles = {
    base: 'px-3 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all',
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md',
    secondary: 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500 shadow-md',
    outlined:
      'bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800 focus:ring-gray-500',
    text: 'bg-transparent text-gray-300 hover:text-white hover:bg-gray-800 focus:ring-gray-500',
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
          <LoaderCircle className='-ml-1 mr-2 animate-spin text-current' size={20} />
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
