import { TriangleAlert } from 'lucide-react';
import type { ErrorDisplayProps } from '@/types/errorDisplay.types';

export const ErrorDisplay = ({ errors }: ErrorDisplayProps) => {
  if (!errors || errors.length === 0) return null;

  return (
    <section className='mb-8' aria-labelledby='errors-section'>
      <div className='rounded-lg border border-destructive-border bg-destructive-bg p-4 shadow-md'>
        <div className='mb-3 flex items-center'>
          <TriangleAlert className='mr-2 text-destructive' size={20} />
          <h2 id='errors-section' className='font-bold text-destructive text-lg'>
            오류 발생 ({errors.length}개)
          </h2>
        </div>
        <ul className='list-inside list-disc text-destructive-muted text-sm'>
          {errors.map((error) => (
            <li key={error.file} className='mb-1'>
              {error.file}: {error.error}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
