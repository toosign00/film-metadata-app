import React from 'react';
import { Footer } from '..';
import GlobalStyles from '../../../styles/GlobalStyles';

/**
 * 모바일 접근 시 표시되는 경고 컴포넌트
 * @returns {JSX.Element} 모바일 경고 UI
 */
const MobileWarning = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-900 text-gray-200">
      <GlobalStyles />
      <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700/50">
          <div className="p-6 text-center">
            <svg className="mx-auto h-16 w-16 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="mt-6 text-2xl font-semibold text-gray-100">PC 환경에서 이용해주세요</h2>
            <p className="mt-4 text-gray-400">현재 모바일 환경에서는 서비스 이용이 제한됩니다.</p>
            <p className="mt-2 text-gray-400">원활한 이용을 위해 PC에서 접속해주시기 바랍니다.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MobileWarning;
