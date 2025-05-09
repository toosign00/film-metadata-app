import React from 'react';
import { Header, Footer } from '@/components/layout';
import GlobalStyles from '@/styles/GlobalStyles';

interface MainLayoutProps {
  children: React.ReactNode;
}

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
