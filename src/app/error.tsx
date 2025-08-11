'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

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
    <html lang='ko'>
      <body>
        <div className='min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center p-6'>
          <div className='w-full max-w-lg rounded-xl border border-gray-700 bg-gray-800 p-6 shadow-md'>
            <h2 className='text-xl font-bold mb-2'>문제가 발생했습니다</h2>
            <p className='text-gray-300 mb-4'>일시적인 오류일 수 있습니다. 다시 시도해 주세요.</p>
            <div className='flex justify-end'>
              <Button variant='primary' onClick={reset}>
                다시 시도
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
