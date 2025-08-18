export const metadata = {
  title: '메타데이터 설정',
  description: '필름 사진의 EXIF 메타데이터를 손쉽게 설정하세요',
};

import { MainLayout } from '@/components/layout/MainLayout';
import { MetadataClientPage } from '@/components/pages/MetadataClientPage';
import { ToasterClient } from '@/components/ui/Toaster';

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
