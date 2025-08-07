import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import type { MainLayoutProps } from '@/types/main-layout.type';

/**
 * 메인 레이아웃 컴포넌트
 * 전체 애플리케이션의 기본 레이아웃 구조를 정의합니다.
 *
 * @param {MainLayoutProps} props
 * @param {React.ReactNode} props.children - 레이아웃 내부에 렌더링될 컴포넌트
 * @returns {JSX.Element} 메인 레이아웃 UI
 */
export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className='flex min-h-screen w-full flex-col overflow-x-hidden bg-gray-900 text-gray-200'>
      <Header />
      {children}
      <Footer />
    </div>
  );
};
