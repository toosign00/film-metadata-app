import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isMobile as detectMobile } from 'react-device-detect';
import type { UseFileDropOptions, UseFileDropReturn } from '../types/hooks.types';

/**
 * 파일 드래그 앤 드롭을 위한 커스텀 훅
 * @param {Function} onFileSelect - 파일 선택 콜백 함수
 * @param {UseFileDropOptions} options - 추가 옵션
 * @param {string[]} options.allowedExtensions - 허용된 파일 확장자 배열
 * @param {number} options.maxFileSize - 최대 파일 크기 (바이트)
 * @param {number} options.maxDesktopFiles - 데스크톱에서 최대 선택 가능한 파일 수
 * @param {number} options.maxMobileFiles - 모바일에서 최대 선택 가능한 파일 수
 */
const useFileDrop = (
  onFileSelect: (files: File[]) => void,
  {
    allowedExtensions = ['jpg', 'jpeg'],
    maxFileSize = 15 * 1024 * 1024, // 15MB
    maxDesktopFiles = 100, // 데스크톱에서 최대 파일 개수 100개로 제한
    maxMobileFiles = 40, // 모바일에서 최대 파일 개수 40개로 제한
  }: UseFileDropOptions = {}
): UseFileDropReturn => {
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement | HTMLButtonElement>(null);
  const isMobile = useMemo(() => detectMobile, []);
  const maxFiles = isMobile ? maxMobileFiles : maxDesktopFiles;

  // 유효한 파일인지 확인하는 헬퍼 함수
  const validateFile = useCallback(
    (file: File): string[] => {
      const errors: string[] = [];
      const ext = file.name.split('.').pop()?.toLowerCase();

      // 확장자 검사
      if (!ext || !allowedExtensions.includes(ext)) {
        errors.push(`지원하지 않는 파일이에요: ${file.name}`);
      }

      // 파일 크기 검사
      if (file.size > maxFileSize) {
        errors.push(`파일 크기는 최대 ${maxFileSize / 1024 / 1024}MB예요: ${file.name}`);
      }

      return errors;
    },
    [allowedExtensions, maxFileSize]
  );

  useEffect(() => {
    const dropArea = dropAreaRef.current;
    if (!dropArea) return;

    const handleDragOver = (e: Event): void => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragEnter = (e: Event): void => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e: Event): void => {
      e.preventDefault();
      e.stopPropagation();

      const relatedTarget = (e as DragEvent | MouseEvent).relatedTarget;
      if (relatedTarget instanceof Node && dropArea.contains(relatedTarget)) {
        return;
      }

      setIsDragging(false);
    };

    const handleDrop = (e: Event): void => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const dragEvent = e as DragEvent;
      if (!dragEvent.dataTransfer) return;

      const droppedFiles = Array.from(dragEvent.dataTransfer.files);
      const validFiles: File[] = [];
      const fileErrors: string[] = [];

      droppedFiles.forEach((file) => {
        const fileValidationErrors = validateFile(file);
        if (fileValidationErrors.length === 0) {
          validFiles.push(file);
        } else {
          fileErrors.push(...fileValidationErrors);
        }
      });

      // 최대 파일 수 제한
      if (validFiles.length > maxFiles) {
        fileErrors.push(`파일은 최대 ${maxFiles}개까지 선택할 수 있어요.`);
      }

      const selectedFiles = validFiles.slice(0, maxFiles);
      if (selectedFiles.length > 0) {
        onFileSelect(selectedFiles);
      }

      setErrors(fileErrors);
    };

    // 이벤트 리스너 등록
    dropArea.addEventListener('dragover', handleDragOver);
    dropArea.addEventListener('dragenter', handleDragEnter);
    dropArea.addEventListener('dragleave', handleDragLeave);
    dropArea.addEventListener('drop', handleDrop);

    // 정리 함수: 이벤트 리스너 제거
    return () => {
      dropArea.removeEventListener('dragover', handleDragOver);
      dropArea.removeEventListener('dragenter', handleDragEnter);
      dropArea.removeEventListener('dragleave', handleDragLeave);
      dropArea.removeEventListener('drop', handleDrop);
    };
  }, [onFileSelect, maxFiles, validateFile]);

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    const validFiles: File[] = [];
    const fileErrors: string[] = [];

    selectedFiles.forEach((file) => {
      const fileValidationErrors = validateFile(file);
      if (fileValidationErrors.length === 0) {
        validFiles.push(file);
      } else {
        fileErrors.push(...fileValidationErrors);
      }
    });

    // 최대 파일 수 제한을 초과할 경우 경고 메시지 추가
    if (validFiles.length > maxFiles) {
      fileErrors.push(`파일은 최대 ${maxFiles}개까지 선택할 수 있어요.`);
    }

    const finalSelectedFiles = validFiles.slice(0, maxFiles);
    if (finalSelectedFiles.length > 0) {
      onFileSelect(finalSelectedFiles);
    }

    setErrors(fileErrors);
  };

  // 파일 선택 다이얼로그 열기
  const openFileDialog = (): void => {
    fileInputRef.current?.click();
  };

  // 에러 초기화
  const clearErrors = (): void => {
    setErrors([]);
  };

  return {
    isDragging,
    fileInputRef,
    dropAreaRef,
    handleFileSelect,
    openFileDialog,
    errors,
    clearErrors,
    isMobile,
    maxFiles,
  };
};

export default useFileDrop;
