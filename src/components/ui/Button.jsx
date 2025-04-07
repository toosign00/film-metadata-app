import React from 'react';

/**
 * Button 컴포넌트
 * @param {Object} props - 버튼 속성
 * @param {string} props.variant - 버튼 스타일 (primary, secondary, outlined, text)
 * @param {boolean} props.isLoading - 로딩 상태
 * @param {boolean} props.disabled - 비활성화 상태
 * @param {Function} props.onClick - 클릭 이벤트 핸들러
 * @param {string} props.type - 버튼 타입 (button, submit)
 * @param {JSX.Element} props.icon - 버튼 아이콘
 * @param {string} props.className - 추가 클래스명
 */
const Button = ({ 
  variant = 'primary',
  isLoading = false,
  disabled = false,
  onClick,
  type = 'button',
  icon,
  className = '',
  children,
  ...rest
}) => {
  // 버튼 스타일 변형
  const styles = {
    base: "px-4 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all",
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md",
    secondary: "bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500 shadow-md",
    outlined: "bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800 focus:ring-gray-500",
    text: "bg-transparent text-gray-300 hover:text-white hover:bg-gray-800 focus:ring-gray-500",
    disabled: "opacity-50 cursor-not-allowed pointer-events-none",
    loading: "cursor-wait"
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
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{typeof children === 'string' ? '처리 중...' : children}</span>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </div>
      )}
    </button>
  );
};

export default Button;