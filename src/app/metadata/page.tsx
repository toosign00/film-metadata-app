import type { Metadata } from 'next';
import { MainLayout } from '@/components/layout/MainLayout';
import { MetadataClientPage } from '@/components/pages/MetadataClientPage';
import { ToasterClient } from '@/components/ui/Toaster';

export const metadata: Metadata = {
  title: '메타데이터 설정',
  description:
    '필름 사진의 EXIF 메타데이터를 손쉽게 설정하세요. 카메라 제조사/모델, 렌즈 정보, 필름 종류, 촬영 날짜/시간을 일괄 적용할 수 있습니다.',
  keywords: [
    'EXIF 메타데이터 설정',
    '카메라 정보 입력',
    '렌즈 정보 편집',
    '필름 종류 설정',
    '촬영 정보 추가',
    '메타데이터 일괄 편집',
    '날짜 시간 설정',
    'ISO 값 입력',
  ],
  alternates: {
    canonical: '/metadata',
  },
};

export default function MetadataPage() {
  return (
    <MainLayout>
      <section className='flex-1 overflow-auto'>
        <div className='mx-auto w-full max-w-6xl'>
          <MetadataClientPage />
        </div>
      </section>
      <ToasterClient />
    </MainLayout>
  );
}
