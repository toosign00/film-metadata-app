import type { Metadata } from 'next';
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
    <>
      <FilesClientPage />
      <ToasterClient />
    </>
  );
}
