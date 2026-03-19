'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang='ko' data-theme='dark'>
      <body>
        <div className='flex min-h-screen items-center justify-center bg-background p-6 text-foreground'>
          <div className='w-full max-w-lg rounded-xl border border-border bg-surface p-6 shadow-md'>
            <h2 className='mb-2 font-bold text-xl'>문제가 발생했습니다</h2>
            <p className='mb-4 text-foreground-secondary'>
              일시적인 오류일 수 있습니다. 다시 시도해 주세요.
            </p>
            <div className='flex justify-end'>
              <button
                type='button'
                className='rounded-lg bg-primary px-3 py-2 font-medium text-primary-foreground shadow-md transition-all hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-ring-offset'
                onClick={reset}
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
