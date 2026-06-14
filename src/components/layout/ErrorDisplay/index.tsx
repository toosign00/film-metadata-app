import { TriangleAlert } from 'lucide-react';
import type { ErrorDisplayProps } from '@/types/errorDisplay.types';

export const ErrorDisplay = ({ errors }: ErrorDisplayProps) => {
  if (!errors || errors.length === 0) return null;

  return (
    <section
      role='status'
      aria-labelledby='errors-section'
      className='mb-6 border-y border-destructive-border bg-destructive-bg py-4'
    >
      <div className='mb-3 flex items-center gap-2'>
        <TriangleAlert aria-hidden='true' className='text-destructive' size={20} />
        <h2 id='errors-section' className='font-bold text-destructive text-lg'>
          처리하지 못한 파일 {errors.length}개
        </h2>
      </div>
      <ul className='space-y-1 text-destructive-muted text-sm'>
        {errors.map((error, index) => (
          <li
            key={
              // biome-ignore lint/suspicious/noArrayIndexKey: The index disambiguates duplicate file errors.
              `${error.file}:${error.error}:${index}`
            }
          >
            <span className='font-medium'>{error.file}</span>
            <span>: {error.error}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};
