import type { ProgressBarProps } from '@/types/progressBar.types';

export const ProgressBar = ({ progress, label, className = '' }: ProgressBarProps) => {
  return (
    <div
      className={`mb-4 rounded-lg border border-border bg-surface p-3 shadow-sm ${className}`}
      aria-live='polite'
    >
      <p className='mb-2 font-medium text-foreground'>
        {label}: {progress}%
      </p>
      <div className='h-2.5 w-full overflow-hidden rounded-full bg-muted'>
        <div
          className='h-2.5 rounded-full bg-primary transition-all duration-300 ease-in-out'
          style={{ width: `${progress}%` }}
          role='progressbar'
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};
