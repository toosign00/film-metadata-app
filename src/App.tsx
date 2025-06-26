import React from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { StepManager } from './components/layout/StepManager';

/**
 * 애플리케이션 루트 컴포넌트
 * 전체 레이아웃 구성을 담당합니다.
 *
 * @returns {JSX.Element} 애플리케이션 UI
 */
const App: React.FC = () => {
  return (
    <MainLayout>
      <StepManager />
    </MainLayout>
  );
};

export default App;
