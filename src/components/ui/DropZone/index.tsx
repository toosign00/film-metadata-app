'use client';

import { ImageUp } from 'lucide-react';
import { useMemo } from 'react';
import useFileDrop from '@/hooks/useFileDrop';
import type { DropZoneProps } from '@/types/dropZone.type';

export const DropZone = ({ onFileSelect, filesCount = 0 }: DropZoneProps) => {
  const { isDragging, fileInputRef, dropAreaRef, handleFileSelect, openFileDialog, isMobile } =
    useFileDrop(onFileSelect, {
      allowedExtensions: ['jpg', 'jpeg'],
      maxFileSize: 15 * 1024 * 1024, // 15MB
      maxDesktopFiles: 100,
      maxMobileFiles: 40,
    });

  // 지원되는 확장자 문자열 생성 (UI에 표시용)
  const supportedExtensionsText = useMemo(() => ['jpg', 'jpeg'].join(', ').toUpperCase(), []);

  // 키보드 이벤트 핸들러
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openFileDialog();
    }
  };

  return (
    <button
      ref={dropAreaRef as React.RefObject<HTMLButtonElement>}
      className={`flex w-full items-center justify-center rounded-lg border-2 border-dashed ${
        isDragging
          ? 'border-blue-500 bg-gray-800'
          : filesCount > 0
            ? 'border-gray-600 bg-gray-800'
            : 'border-gray-600 bg-gray-800'
      } cursor-pointer p-4 text-center transition-all hover:border-blue-500`}
      onClick={openFileDialog}
      onKeyDown={handleKeyDown}
      aria-label='파일 선택 영역'
      style={{ minHeight: '300px', height: '100%' }}
      type='button'
    >
      <input
        type='file'
        id='file-input'
        name='files'
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        accept='.jpg,.jpeg'
        className='hidden'
        aria-describedby='file-format-info'
      />

      <div className='flex flex-col items-center justify-center py-5'>
        <ImageUp
          className={`mb-2 h-12 w-12 ${isDragging ? 'text-blue-500' : filesCount > 0 ? 'text-blue-500' : 'text-gray-500'}`}
          aria-hidden='true'
          role='img'
        />

        {isDragging ? (
          <div>
            <p className='font-medium text-blue-400 text-lg'>파일을 여기에 놓으세요</p>
            <p className='text-blue-300 text-sm'>{supportedExtensionsText} 파일만 지원됩니다</p>
          </div>
        ) : filesCount > 0 ? (
          <div>
            <p className='font-medium text-gray-200 text-lg'>{filesCount}개의 파일이 선택됨</p>
            <p className='text-gray-400 text-sm'>클릭하여 다른 파일 선택</p>
          </div>
        ) : (
          <div>
            <p className='font-medium text-gray-300 text-lg'>이미지 파일을 선택하세요</p>
            <p className='text-gray-400 text-sm'>또는 여기에 파일을 끌어다 놓으세요</p>
          </div>
        )}

        <div>
          <p id='file-format-info' className='mt-2 text-gray-500 text-xs'>
            지원 형식: {supportedExtensionsText} (최대 15MB)
          </p>
          <p className='mt-2 text-gray-500 text-xs'>최대 파일 수: {isMobile ? 40 : 100}개</p>
        </div>
      </div>
    </button>
  );
};
