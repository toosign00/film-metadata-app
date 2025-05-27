import React from 'react';
import { ErrorDisplayProps } from '@/types/error-display.type';

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ errors }) => {
  if (!errors || errors.length === 0) return null;

  return (
    <section className="mb-8" aria-labelledby="errors-section">
      <div className="p-4 bg-red-900 bg-opacity-20 rounded-lg border border-red-800 shadow-md">
        <div className="flex items-center mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 id="errors-section" className="text-lg font-bold text-red-500">
            오류 발생 ({errors.length}개)
          </h2>
        </div>
        <ul className="text-sm text-red-400 list-disc list-inside">
          {errors.map((error, idx) => (
            <li key={idx} className="mb-1">
              {error.file}: {error.error}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default ErrorDisplay;
