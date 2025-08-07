import { TriangleAlert } from 'lucide-react';
import type { ErrorDisplayProps } from '@/types/error-display.type';

export const ErrorDisplay = ({ errors }: ErrorDisplayProps) => {
  if (!errors || errors.length === 0) return null;

  return (
    <section className='mb-8' aria-labelledby='errors-section'>
      <div className='bg-opacity-20 rounded-lg border border-red-800 bg-red-900 p-4 shadow-md'>
        <div className='mb-3 flex items-center'>
          <TriangleAlert className='mr-2 text-red-500' size={20} />
          <h2 id='errors-section' className='text-lg font-bold text-red-500'>
            오류 발생 ({errors.length}개)
          </h2>
        </div>
        <ul className='list-inside list-disc text-sm text-red-400'>
          {errors.map((error, idx) => (
            <li key={`${error.file}-${idx}`} className='mb-1'>
              {error.file}: {error.error}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
