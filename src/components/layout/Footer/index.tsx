import type { FooterProps } from '@/types/footer.type';

export const Footer = ({ className }: FooterProps) => {
  return (
    <footer
      className={`border-t border-gray-700 bg-gray-900 p-6 md:p-8 text-sm text-gray-400 ${className || ''}`}
    >
      <div className='mx-auto max-w-6xl text-center'>
        <p className='text-xs sm:text-base'>
          이 도구는 이미지 파일의 EXIF 메타데이터를 브라우저에서 직접 설정합니다.
          <br />
          <span className='text-xs text-gray-500'>
            파일은 서버로 업로드되지 않으며, 모든 처리는 브라우저에서만 이루어집니다.
          </span>
          <br />
        </p>
        <p className='mt-2 flex flex-row items-center justify-center gap-2'>
          <span className='text-xs text-gray-500 sm:text-sm'>
            &copy; 2025. Hyunsoo Ro. All rights reserved.
          </span>
          <a
            className='text-xs sm:text-sm'
            href='mailto:kevinsoo1014@gmail.com?subject=문의드립니다.'
          >
            kevinsoo1014@gmail.com
          </a>
        </p>
      </div>
    </footer>
  );
};
