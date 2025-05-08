import React from 'react';
import { MainLayout, StepManager } from '@/components/layout';

/**
 * 애플리케이션 루트 컴포넌트
 * 전체 레이아웃 구성을 담당합니다.
 *
 * @returns {JSX.Element} 애플리케이션 UI
 */
const App = () => {
  return (
    <MainLayout>
      <StepManager />
    </MainLayout>
  );
};

export default App;
