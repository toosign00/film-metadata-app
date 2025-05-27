import React from 'react';
import { Header, Footer } from '@/components/layout';
import GlobalStyles from '@/styles/GlobalStyles';
import { MainLayoutProps } from '@/types/main-layout.type';

/**
 * 메인 레이아웃 컴포넌트
 * 전체 애플리케이션의 기본 레이아웃 구조를 정의합니다.
 *
 * @param {MainLayoutProps} props
 * @param {React.ReactNode} props.children - 레이아웃 내부에 렌더링될 컴포넌트
 * @returns {JSX.Element} 메인 레이아웃 UI
 */
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-900 text-gray-200 overflow-x-hidden">
      <GlobalStyles />
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default MainLayout;
