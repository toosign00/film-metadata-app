export const metadata = {
  title: 'Film Metadata Settings App',
  description: '필름 사진을 업로드하고 메타데이터 편집을 시작하세요',
};

import { MainLayout } from '@/components/layout/MainLayout';
import { FilesClientPage } from '@/components/pages/FilesClientPage';
import { ToasterClient } from '@/components/ui/Toaster';

export default function HomePage() {
  return (
    <MainLayout>
      <main className='flex-1 overflow-auto p-4 md:p-6'>
        <div className='mx-auto w-full max-w-6xl'>
          <FilesClientPage />
        </div>
      </main>
      <ToasterClient />
    </MainLayout>
  );
}
