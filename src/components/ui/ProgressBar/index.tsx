import { useId } from 'react';
import type { ProgressBarProps } from '@/types/progressBar.types';

export const ProgressBar = ({ progress, label, className = '' }: ProgressBarProps) => {
  const labelId = useId();
  const normalizedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`mb-6 border-y border-border py-4 ${className}`} aria-live='polite'>
      <div className='mb-2 flex items-center justify-between text-xs'>
        <span id={labelId} className='font-medium text-foreground-secondary'>
          {label}
        </span>
        <span className='text-foreground-muted'>{normalizedProgress}%</span>
      </div>
      <div className='h-1.5 w-full overflow-hidden rounded-full bg-muted'>
        <div
          className='h-full rounded-full bg-primary transition-[width] duration-300'
          style={{ width: `${normalizedProgress}%` }}
          role='progressbar'
          aria-labelledby={labelId}
          aria-valuenow={normalizedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};
