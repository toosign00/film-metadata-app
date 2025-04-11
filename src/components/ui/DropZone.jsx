import React, { useRef, useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';

const DropZone = ({ onFileSelect, filesCount = 0 }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);

  // 지원하는 이미지 확장자 배열
  const SUPPORTED_IMAGE_EXTENSIONS = ['jpg', 'jpeg'];

  // 환경에 따른 최대 파일 수 설정
  const maxFiles = isMobile ? 45 : 100;

  // 드래그 앤 드롭 이벤트 리스너 설정
  useEffect(() => {
    const dropArea = dropAreaRef.current;

    if (!dropArea) return;

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragEnter = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files).filter((file) => {
        const ext = file.name.split('.').pop().toLowerCase();
        return SUPPORTED_IMAGE_EXTENSIONS.includes(ext);
      });

      if (droppedFiles.length > 0) {
        // 최대 파일 수 제한 적용
        const selectedFiles = droppedFiles.slice(0, maxFiles);
        onFileSelect(selectedFiles);
      }
    };

    dropArea.addEventListener('dragover', handleDragOver);
    dropArea.addEventListener('dragenter', handleDragEnter);
    dropArea.addEventListener('dragleave', handleDragLeave);
    dropArea.addEventListener('drop', handleDrop);

    return () => {
      dropArea.removeEventListener('dragover', handleDragOver);
      dropArea.removeEventListener('dragenter', handleDragEnter);
      dropArea.removeEventListener('dragleave', handleDragLeave);
      dropArea.removeEventListener('drop', handleDrop);
    };
  }, [onFileSelect, maxFiles]);

  // 파일 선택 핸들러
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files).filter((file) => {
      const ext = file.name.split('.').pop().toLowerCase();
      return SUPPORTED_IMAGE_EXTENSIONS.includes(ext);
    });

    if (selectedFiles.length > 0) {
      // 최대 파일 수 제한 적용
      const limitedFiles = selectedFiles.slice(0, maxFiles);
      onFileSelect(limitedFiles);
    }
  };

  // 지원되는 확장자 문자열 생성 (UI에 표시용)
  const supportedExtensionsText = SUPPORTED_IMAGE_EXTENSIONS.join(', ').toUpperCase();

  return (
    <div
      ref={dropAreaRef}
      className={`flex items-center justify-center border-2 border-dashed rounded-lg ${
        isDragging ? 'border-blue-500 bg-gray-800' : filesCount > 0 ? 'border-gray-600 bg-gray-800' : 'border-gray-600 bg-gray-800'
      } p-4 text-center cursor-pointer transition-all hover:border-blue-500`}
      onClick={() => fileInputRef.current.click()}
      style={{ minHeight: '300px', height: '100%' }}
    >
      <input
        type="file"
        id="file-input"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        accept={`.${SUPPORTED_IMAGE_EXTENSIONS.join(',.')}`}
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
            최대 파일 수: {isMobile ? '45개' : '100개'}
            {isMobile && <span className="ml-1">(모바일 환경)</span>}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DropZone;
