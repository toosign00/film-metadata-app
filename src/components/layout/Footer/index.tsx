import type { FooterProps } from '@/types/footer.type';

export const Footer = ({ className }: FooterProps) => {
  return (
    <footer
      className={`border-t border-gray-700 bg-gray-900 p-4 text-sm text-gray-400 ${className || ''}`}
    >
      <div className='mx-auto max-w-6xl text-center'>
        <p className='text-xs sm:text-base'>
          이 도구는 이미지 파일의 EXIF 메타데이터를 서버에서 처리합니다.
          <br />
          <span className='text-xs text-gray-500'>
            업로드된 파일은 처리 완료 즉시 삭제되며 서버에 보관되지 않습니다. 안심하고 이용하세요.
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
