import React from 'react';
import { MainLayout, MobileWarning, StepManager } from '@/components/layout';
import { useMobileDetection } from '@/hooks/useMobileDetection';

/**
 * 애플리케이션 루트 컴포넌트
 * 모바일 감지 및 전체 레이아웃 구성을 담당합니다.
 *
 * @returns {JSX.Element} 애플리케이션 UI
 */
const App = () => {
  const showMobileWarning = useMobileDetection();

  if (showMobileWarning) {
    return <MobileWarning />;
  }

  return (
    <MainLayout>
      <StepManager />
    </MainLayout>
  );
};

export default App;
