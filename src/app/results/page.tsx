import type { Metadata } from 'next';
import { MainLayout } from '@/components/layout/MainLayout';
import { ResultsClientPage } from '@/components/pages/ResultsClientPage';
import { ToasterClient } from '@/components/ui/Toaster';

export const metadata: Metadata = {
  title: '결과 다운로드',
  description: '메타데이터가 적용된 필름 사진을 개별 또는 ZIP 파일로 다운로드하세요.',
  keywords: [
    '메타데이터 적용 완료',
    '필름 사진 다운로드',
    'EXIF 포함 이미지',
    'ZIP 일괄 다운로드',
    '메타데이터 적용 완료',
    '필름 사진 다운로드',
    'EXIF 포함 이미지',
    'ZIP 일괄 다운로드',
  ],
  alternates: {
    canonical: '/results',
  },
};

export default function ResultsPage() {
  return (
    <MainLayout>
      <section className='flex-1 overflow-auto'>
        <div className='mx-auto w-full max-w-6xl'>
          <ResultsClientPage />
        </div>
      </section>
      <ToasterClient />
    </MainLayout>
  );
}
