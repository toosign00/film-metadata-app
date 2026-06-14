import type { FooterProps } from '@/types/footer.types';

export const Footer = ({ className }: FooterProps) => {
  const year = new Date().getFullYear();

  return (
    <footer className={`border-t border-border ${className ?? ''}`}>
      <div className='mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-4 py-5 text-center text-[11px] text-foreground-muted sm:px-6 md:flex-row md:text-left'>
        <p>파일은 서버에 올리지 않고 브라우저에서 안전하게 처리해요.</p>
        <p className='flex flex-wrap items-center justify-center gap-x-3 gap-y-1 md:justify-end'>
          <span>&copy; {year} Hyunsoo Ro</span>
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
