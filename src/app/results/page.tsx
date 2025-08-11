export const metadata = {
  title: '결과 다운로드',
  description: '편집된 이미지와 ZIP 파일을 다운로드하세요',
};

import { MainLayout } from '@/components/layout/MainLayout';
import { ResultsClientPage } from '@/components/pages/ResultsClientPage';
import { ToasterClient } from '@/components/ui/Toaster';

export default function ResultsPage() {
  return (
    <MainLayout>
      <main className='flex-1 overflow-auto p-4 md:p-6'>
        <div className='mx-auto w-full max-w-6xl'>
          <ResultsClientPage />
        </div>
      </main>
      <ToasterClient />
    </MainLayout>
  );
}
