'use client';

import { ImageUp } from 'lucide-react';
import { useMemo } from 'react';
import useFileDrop from '@/hooks/useFileDrop';
import type { DropZoneProps } from '@/types/dropZone.types';

export const DropZone = ({ onFileSelect, filesCount = 0 }: DropZoneProps) => {
  const { isDragging, fileInputRef, dropAreaRef, handleFileSelect, openFileDialog, isMobile } =
    useFileDrop(onFileSelect, {
      allowedExtensions: ['jpg', 'jpeg'],
      maxFileSize: 15 * 1024 * 1024,
      maxDesktopFiles: 100,
      maxMobileFiles: 40,
    });

  const supportedExtensionsText = useMemo(() => ['jpg', 'jpeg'].join(', ').toUpperCase(), []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openFileDialog();
    }
  };

  return (
    <button
      ref={dropAreaRef as React.RefObject<HTMLButtonElement>}
      className={`flex w-full items-center justify-center rounded-xl border-[1.5px] border-dashed ${
        isDragging
          ? 'border-primary bg-primary/5'
          : filesCount > 0
            ? 'border-primary/40 bg-surface'
            : 'border-border-hover bg-surface hover:border-primary/60'
      } cursor-pointer p-4 text-center transition-all`}
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
          className={`mb-3 h-9 w-9 ${isDragging ? 'text-primary' : filesCount > 0 ? 'text-primary/70' : 'text-foreground-muted'}`}
          aria-hidden='true'
          role='img'
        />

        {isDragging ? (
          <div>
            <p className='font-semibold text-primary text-base'>파일을 여기에 놓으세요</p>
            <p className='mt-1 text-primary/70 text-sm'>{supportedExtensionsText} 파일만 지원됩니다</p>
          </div>
        ) : filesCount > 0 ? (
          <div>
            <p className='font-semibold text-foreground text-base'>{filesCount}개의 파일이 선택됨</p>
            <p className='mt-1 text-foreground-muted text-sm'>클릭하여 다른 파일 선택</p>
          </div>
        ) : (
          <div>
            <p className='font-semibold text-foreground-secondary text-base'>이미지 파일을 선택하세요</p>
            <p className='mt-1 text-foreground-muted text-sm'>또는 여기에 파일을 끌어다 놓으세요</p>
          </div>
        )}

        <div className='mt-3'>
          <p id='file-format-info' className='text-foreground-muted text-xs'>
            지원 형식: {supportedExtensionsText} &middot; 최대 15MB
          </p>
          <p className='mt-1 text-foreground-muted text-xs'>
            최대 파일 수: {isMobile ? 40 : 100}개
          </p>
        </div>
      </div>
    </button>
  );
};
