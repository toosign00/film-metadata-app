import React from 'react';

const ProgressBar = ({ progress, label, className = '' }) => {
  return (
    <div className={`mb-4 bg-gray-800 rounded-lg border border-gray-700 p-3 shadow-sm ${className}`} aria-live="polite">
      <p className="text-gray-200 font-medium mb-2">
        {label}: {progress}%
      </p>
      <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
