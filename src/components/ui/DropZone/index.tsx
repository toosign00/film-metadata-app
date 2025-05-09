import React from 'react';
import useFileDrop from '@/hooks/useFileDrop';

interface DropZoneProps {
  onFileSelect: (files: File[]) => void;
  filesCount?: number;
}

const DropZone: React.FC<DropZoneProps> = ({ onFileSelect, filesCount = 0 }) => {
  const { isDragging, fileInputRef, dropAreaRef, handleFileSelect, errors, isMobile, maxFiles, openFileDialog } = useFileDrop(onFileSelect, {
    allowedExtensions: ['jpg', 'jpeg'],
    maxFileSize: 15 * 1024 * 1024, // 15MB
    maxDesktopFiles: 100,
    maxMobileFiles: 40,
  });

  // 지원되는 확장자 문자열 생성 (UI에 표시용)
  const supportedExtensionsText = ['jpg', 'jpeg'].join(', ').toUpperCase();

  return (
    <div
      ref={dropAreaRef}
      className={`flex items-center justify-center border-2 border-dashed rounded-lg ${
        isDragging ? 'border-blue-500 bg-gray-800' : filesCount > 0 ? 'border-gray-600 bg-gray-800' : 'border-gray-600 bg-gray-800'
      } p-4 text-center cursor-pointer transition-all hover:border-blue-500`}
      onClick={openFileDialog}
      style={{ minHeight: '300px', height: '100%' }}
    >
      <input
        type="file"
        id="file-input"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        accept=".jpg,.jpeg"
        className="hidden"
        aria-describedby="file-format-info"
      />

      <div className="flex flex-col items-center justify-center py-5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-12 w-12 mb-2 ${isDragging ? 'text-blue-500' : filesCount > 0 ? 'text-blue-500' : 'text-gray-500'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>

        {isDragging ? (
          <div>
            <p className="text-lg font-medium text-blue-400">파일을 여기에 놓으세요</p>
            <p className="text-sm text-blue-300">{supportedExtensionsText} 파일만 지원됩니다</p>
          </div>
        ) : filesCount > 0 ? (
          <div>
            <p className="text-lg font-medium text-gray-200">{filesCount}개의 파일이 선택됨</p>
            <p className="text-sm text-gray-400">클릭하여 다른 파일 선택</p>
          </div>
        ) : (
          <div>
            <p className="text-lg font-medium text-gray-300">이미지 파일을 선택하세요</p>
            <p className="text-sm text-gray-400">또는 여기에 파일을 끌어다 놓으세요</p>
          </div>
        )}

        <div>
          <p id="file-format-info" className="mt-2 text-xs text-gray-500">
            지원 형식: {supportedExtensionsText} (최대 15MB)
          </p>
          <p className="mt-2 text-xs text-gray-500">
            최대 파일 수: {isMobile ? '40개' : '100개'}
            {isMobile && <span className="ml-1">(모바일 환경)</span>}
          </p>
          {errors.length > 0 && (
            <div className="mt-2 text-xs text-red-500">
              {errors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DropZone;
