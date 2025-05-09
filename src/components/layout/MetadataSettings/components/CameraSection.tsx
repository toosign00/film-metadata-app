import React from 'react';
import { MetadataSettings } from '../../../../config/constants';

interface ValidationErrors {
  cameraMake?: string;
  cameraModel?: string;
}

interface CameraSectionProps {
  settings: MetadataSettings;
  validationErrors: ValidationErrors;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CameraSection: React.FC<CameraSectionProps> = ({ settings, validationErrors, handleInputChange }) => {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 shadow-md" role="group" aria-labelledby="camera-heading">
      <h3 id="camera-heading" className="font-medium text-gray-200 mb-3 pb-2 border-b border-gray-700">
        카메라 정보
      </h3>

      <div className="mb-4 relative">
        <label htmlFor="cameraMake" className="block text-gray-300 font-medium mb-1 text-sm">
          제조사
        </label>
        <input
          type="text"
          id="cameraMake"
          name="cameraMake"
          value={settings.cameraMake}
          onChange={handleInputChange}
          className="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="예: Nikon"
          aria-describedby="cameraMake-help cameraMake-error"
          aria-invalid={!!validationErrors.cameraMake}
          autoComplete="off"
          required
        />
        <div className="flex justify-between items-center flex-wrap">
          <p id="cameraMake-help" className="mt-1 text-xs text-gray-500">
            카메라 제조사를 입력하세요
          </p>
          {validationErrors.cameraMake && (
            <p id="cameraMake-error" className="mt-1 text-xs text-red-500" role="alert">
              {validationErrors.cameraMake}
            </p>
          )}
        </div>
      </div>

      <div className="relative">
        <label htmlFor="cameraModel" className="block text-gray-300 font-medium mb-1 text-sm">
          모델명
        </label>
        <input
          type="text"
          id="cameraModel"
          name="cameraModel"
          value={settings.cameraModel}
          onChange={handleInputChange}
          className="w-full bg-gray-800 text-gray-200 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="예: FM2"
          aria-describedby="cameraModel-help cameraModel-error"
          aria-invalid={!!validationErrors.cameraModel}
          autoComplete="off"
          required
        />
        <div className="flex justify-between items-center flex-wrap">
          <p id="cameraModel-help" className="mt-1 text-xs text-gray-500">
            카메라 모델명을 입력하세요
          </p>
          {validationErrors.cameraModel && (
            <p id="cameraModel-error" className="mt-1 text-xs text-red-500" role="alert">
              {validationErrors.cameraModel}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraSection;
