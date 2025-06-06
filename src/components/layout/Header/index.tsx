import React from 'react';
import { HeaderProps } from '@/types/header.type';

const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header className={`bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 md:p-8 border-b border-gray-700 ${className || ''}`}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">필름 사진 메타데이터 설정 도구</h1>
        <p className="text-gray-300 md:text-lg">스캔된 필름 사진에 날짜 및 시간, 카메라, 렌즈, 필름 정보 등의 메타데이터를 일괄 설정합니다.</p>
      </div>
    </header>
  );
};

export default Header;
