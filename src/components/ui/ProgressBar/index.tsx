import { ProgressBarProps } from '@/types/progressBar.type';

export const ProgressBar = ({ progress, label, className = '' }: ProgressBarProps) => {
  return (
    <div
      className={`mb-4 rounded-lg border border-gray-700 bg-gray-800 p-3 shadow-sm ${className}`}
      aria-live="polite"
    >
      <p className="mb-2 font-medium text-gray-200">
        {label}: {progress}%
      </p>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-700">
        <div
          className="h-2.5 rounded-full bg-blue-600 transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        ></div>
      </div>
    </div>
  );
};
