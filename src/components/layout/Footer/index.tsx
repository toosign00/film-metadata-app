import type { FooterProps } from '@/types/footer.types';

export const Footer = ({ className }: FooterProps) => {
  const year = new Date().getFullYear();
  return (
    <footer className={`border-t border-border px-6 py-5 md:px-8 ${className || ''}`}>
      <div className='mx-auto max-w-6xl'>
        <p className='text-center text-xs text-foreground-muted'>
          파일은 서버로 업로드되지 않으며, 모든 처리는 브라우저에서만 이루어집니다.
        </p>
        <p className='mt-2 flex flex-row items-center justify-center gap-3 text-xs text-foreground-muted'>
          <span>&copy; {year} Hyunsoo Ro. All rights reserved.</span>
          <a
            className='text-foreground-muted underline-offset-4 transition-colors hover:text-foreground hover:underline'
            href='mailto:kevinsoo1014@gmail.com?subject=문의드립니다.'
          >
            kevinsoo1014@gmail.com
          </a>
        </p>
      </div>
    </footer>
  );
};
