'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function ErrorPage({
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
    <main className='grid min-h-[60vh] place-items-center p-6'>
      <section className='w-full max-w-md rounded-2xl border border-border bg-surface p-6'>
        <h1 className='text-xl font-semibold text-foreground'>문제가 생겼어요</h1>
        <p className='mt-3 text-sm leading-7 text-foreground-muted'>
          잠시 후 다시 시도해 주세요. 같은 문제가 계속되면 새로고침해 주세요.
        </p>
        <div className='mt-5 flex justify-end'>
          <Button onClick={reset}>다시 시도해요</Button>
        </div>
      </section>
    </main>
  );
}
