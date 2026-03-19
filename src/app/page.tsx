import type { Metadata } from 'next';
import { WizardClient } from '@/components/pages/WizardClient';
import { ToasterClient } from '@/components/ui/Toaster';

export const metadata: Metadata = {
  description: '필름 사진의 EXIF 메타데이터를 손쉽게 편집, 다운로드할 수 있는 웹 도구',
  keywords: [
    'EXIF 메타데이터 설정',
    '카메라 정보 입력',
    '렌즈 정보 편집',
    '필름 종류 설정',
    '촬영 정보 추가',
    '메타데이터 일괄 편집',
    '날짜 시간 설정',
    'ISO 값 입력',
    '메타데이터 적용 완료',
    '필름 사진 다운로드',
    'EXIF 포함 이미지',
    'ZIP 일괄 다운로드',
  ],
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return (
    <>
      <WizardClient />
      <ToasterClient />
    </>
  );
}
