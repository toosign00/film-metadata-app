import React from 'react';
import { LensSectionProps } from '@/types/metadata-settings.type';

const LensSection: React.FC<LensSectionProps> = ({ settings, validationErrors, handleInputChange, handleLensInfoChange }) => {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 shadow-md" role="group" aria-labelledby="lens-info-heading">
      <h3 id="lens-info-heading" className="font-medium text-gray-200 mb-3 pb-2 border-b border-gray-700">
        렌즈 정보
      </h3>

      <div className="mb-4 relative">
        <label htmlFor="lens" className="block text-gray-300 font-medium mb-1 text-sm">
          렌즈
        </label>
        <input
          type="text"
          id="lens"
          name="lens"
          value={settings.lens}
          onChange={handleInputChange}
          placeholder="예: Canon FD, Nikkor AF 35mm-70mm"
          className="w-full px-4 py-2.5 bg-gray-800 border text-gray-200 border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
          aria-describedby="lens-help lens-error"
          aria-required="true"
          aria-invalid={!!validationErrors.lens}
        />
        <div className="flex justify-between items-center flex-wrap">
          <p id="lens-help" className="mt-1 text-xs text-gray-500">
            렌즈 브랜드와 모델명
          </p>
          {validationErrors.lens && (
            <p id="lens-error" className="mt-1 text-xs text-red-500" role="alert">
              {validationErrors.lens}
            </p>
          )}
        </div>
      </div>

      <div className="relative">
        <label htmlFor="lensInfo" className="block text-gray-300 font-medium mb-1 text-sm">
          렌즈 정보
        </label>
        <input
          type="text"
          id="lensInfo"
          name="lensInfo"
          value={settings.lensInfo}
          onChange={handleLensInfoChange}
          placeholder="예: 35mm f2.4, 28mm f2.8"
          className="w-full px-4 py-2.5 bg-gray-800 border text-gray-200 border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
          aria-describedby="lensInfo-help lensInfo-error"
          aria-required="true"
          aria-invalid={!!validationErrors.lensInfo}
        />
        <div className="flex justify-between items-center flex-wrap">
          <p id="lensInfo-help" className="mt-1 text-xs text-gray-500">
            초점 거리와 조리개 값 (예: 50mm f2.8)
          </p>
          {validationErrors.lensInfo && (
            <p id="lensInfo-error" className="mt-1 text-xs text-red-500" role="alert">
              {validationErrors.lensInfo}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LensSection;
