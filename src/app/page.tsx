import type { Metadata } from 'next';
import { MainLayout } from '@/components/layout/MainLayout';
import { FilesClientPage } from '@/components/pages/FilesClientPage';
import { ToasterClient } from '@/components/ui/Toaster';

export const metadata: Metadata = {
  description: '필름 사진을 업로드하고 메타데이터 편집을 시작하세요',
  alternates: {
    canonical: '/',
  },
};
export default function HomePage() {
  return (
    <MainLayout>
      <main className='flex-1 overflow-auto p-6 md:p-8'>
        <div className='mx-auto w-full max-w-6xl'>
          <FilesClientPage />
        </div>
      </main>
      <ToasterClient />
    </MainLayout>
  );
}
