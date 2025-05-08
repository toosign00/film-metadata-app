import React from 'react';
import { Header, Footer } from '@/components/layout';
import GlobalStyles from '@/styles/GlobalStyles';

/**
 * 메인 레이아웃 컴포넌트
 * 전체 애플리케이션의 기본 레이아웃 구조를 정의합니다.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - 레이아웃 내부에 렌더링될 컴포넌트
 * @returns {JSX.Element} 메인 레이아웃 UI
 */
const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-900 text-gray-200">
      <GlobalStyles />
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default MainLayout;
