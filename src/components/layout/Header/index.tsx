import type { HeaderProps } from '@/types/header.types';

export const Header = ({ className }: HeaderProps) => {
  return (
    <header
      className={`border-gray-700 border-b bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white md:p-8 ${className || ''}`}
    >
      <div className='mx-auto max-w-6xl'>
        <h1 className='mb-2 font-bold text-2xl md:text-3xl'>필름 사진 메타데이터 설정 도구</h1>
        <p className='text-gray-300 md:text-lg'>
          스캔된 필름 사진에 날짜 및 시간, 카메라, 렌즈, 필름 정보 등의 메타데이터를 일괄
          설정합니다.
        </p>
      </div>
    </header>
  );
};
