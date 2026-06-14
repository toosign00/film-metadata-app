import type { ProgressBarProps } from '@/types/progressBar.types';

export const ProgressBar = ({ progress, label, className = '' }: ProgressBarProps) => {
  return (
    <div className={`mb-6 border-y border-border py-4 ${className}`} aria-live='polite'>
      <div className='mb-2 flex items-center justify-between text-xs'>
        <span className='font-medium text-foreground'>{label}</span>
        <span className='text-foreground-muted'>{progress}%</span>
      </div>
      <div className='h-1.5 w-full overflow-hidden rounded-full bg-muted'>
        <div
          className='h-full rounded-full bg-primary transition-[width] duration-300'
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
