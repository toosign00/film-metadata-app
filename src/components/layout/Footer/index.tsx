import type { FooterProps } from '@/types/footer.types';

export const Footer = ({ className }: FooterProps) => {
  const year = new Date().getFullYear();
  return (
    <footer
      className={`border-border border-t p-6 text-foreground-muted text-sm md:p-8 ${className || ''}`}
    >
      <div className='mx-auto max-w-6xl text-center'>
        <p className='text-xs sm:text-base'>
          이 도구는 이미지 파일의 EXIF 메타데이터를 브라우저에서 직접 설정합니다.
          <br />
          <span className='text-foreground-muted text-xs'>
            파일은 서버로 업로드되지 않으며, 모든 처리는 브라우저에서만 이루어집니다.
          </span>
          <br />
        </p>
        <p className='mt-2 flex flex-row items-center justify-center gap-2'>
          <span className='text-foreground-muted text-xs sm:text-sm'>
            &copy; {year}. Hyunsoo Ro. All rights reserved.
          </span>
          <a
            className='text-xs sm:text-sm text-primary hover:text-primary-hover'
            href='mailto:kevinsoo1014@gmail.com?subject=문의드립니다.'
          >
            kevinsoo1014@gmail.com
          </a>
        </p>
      </div>
    </footer>
  );
};
