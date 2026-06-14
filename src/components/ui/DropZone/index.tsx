'use client';

import { ImageUp } from 'lucide-react';
import useFileDrop from '@/hooks/useFileDrop';
import type { DropZoneProps } from '@/types/dropZone.types';

export const DropZone = ({ onFileSelect, filesCount = 0 }: DropZoneProps) => {
  const {
    isDragging,
    fileInputRef,
    dropAreaRef,
    handleFileSelect,
    openFileDialog,
    errors,
    maxFiles,
  } = useFileDrop(onFileSelect, {
    allowedExtensions: ['jpg', 'jpeg'],
    maxFileSize: 15 * 1024 * 1024,
    maxDesktopFiles: 100,
    maxMobileFiles: 40,
  });

  const handleOpenFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    openFileDialog();
  };

  return (
    <div className='min-w-0'>
      <input
        type='file'
        id='file-input'
        name='files'
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        accept='.jpg,.jpeg'
        className='hidden'
      />

      <button
        ref={dropAreaRef as React.RefObject<HTMLButtonElement>}
        className={`flex h-[360px] w-full cursor-pointer items-center justify-center rounded-2xl border-[1.5px] border-dashed ${
          isDragging
            ? 'border-primary bg-primary/5'
            : filesCount > 0
              ? 'border-primary/30 bg-surface'
              : 'border-border-hover bg-surface hover:border-primary/60'
        } p-4 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset`}
        onClick={handleOpenFileDialog}
        aria-describedby={errors.length > 0 ? 'file-format-info file-errors' : 'file-format-info'}
        type='button'
      >
        <div className='flex flex-col items-center justify-center py-5'>
          <ImageUp
            className={`mb-3 h-8 w-8 ${isDragging ? 'text-primary' : filesCount > 0 ? 'text-primary/70' : 'text-foreground-muted'}`}
            aria-hidden='true'
          />

          <p
            className={`text-base font-semibold ${
              isDragging
                ? 'text-primary'
                : filesCount > 0
                  ? 'text-foreground'
                  : 'text-foreground-secondary'
            }`}
          >
            {isDragging
              ? '여기에 놓아주세요'
              : filesCount > 0
                ? `${filesCount}개 파일을 선택했어요`
                : '이미지를 끌어놓거나 파일을 선택해요'}
          </p>
          <p id='file-format-info' className='text-foreground-muted text-xs'>
            파일당 최대 15MB · 최대 {maxFiles}개
          </p>
        </div>
      </button>

      {errors.length > 0 && (
        <ul
          id='file-errors'
          className='mt-3 space-y-1 text-xs text-destructive-muted'
          role='status'
          aria-live='polite'
        >
          {errors.map((error, index) => (
            <li
              key={
                // biome-ignore lint/suspicious/noArrayIndexKey: The index disambiguates duplicate errors.
                `${error}-${index}`
              }
              className='break-words'
            >
              {error}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
