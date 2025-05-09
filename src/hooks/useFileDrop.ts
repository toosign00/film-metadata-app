import { useState, useRef, useEffect } from 'react';
import { isMobile as detectMobile } from 'react-device-detect';

interface UseFileDropOptions {
  allowedExtensions?: string[];
  maxFileSize?: number;
  maxDesktopFiles?: number;
  maxMobileFiles?: number;
}

interface UseFileDropReturn {
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  dropAreaRef: React.RefObject<HTMLDivElement | null>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  openFileDialog: () => void;
  errors: string[];
  clearErrors: () => void;
  isMobile: boolean;
  maxFiles: number;
}

const useFileDrop = (
  onFileSelect: (files: File[]) => void,
  {
    allowedExtensions = ['jpg', 'jpeg'],
    maxFileSize = 15 * 1024 * 1024, // 15MB
    maxDesktopFiles = 100,
    maxMobileFiles = 40,
  }: UseFileDropOptions = {}
): UseFileDropReturn => {
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(detectMobile);
  const maxFiles = isMobile ? maxMobileFiles : maxDesktopFiles;

  const validateFile = (file: File): string[] => {
    const errors: string[] = [];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (!allowedExtensions.includes(ext)) {
      errors.push(`지원되지 않는 파일 형식입니다: ${file.name}`);
    }

    if (file.size > maxFileSize) {
      errors.push(`파일 크기가 너무 큽니다: ${file.name} (최대 ${maxFileSize / 1024 / 1024}MB)`);
    }

    return errors;
  };

  useEffect(() => {
    const dropArea = dropAreaRef.current;
    if (!dropArea) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (!e.dataTransfer?.files) return;

      const droppedFiles = Array.from(e.dataTransfer.files);
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

      if (validFiles.length > maxFiles) {
        fileErrors.push(`최대 ${maxFiles}개의 파일만 선택할 수 있습니다.`);
      }

      const selectedFiles = validFiles.slice(0, maxFiles);
      if (selectedFiles.length > 0) {
        onFileSelect(selectedFiles);
      }

      if (fileErrors.length > 0) {
        setErrors(fileErrors);
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
  }, [onFileSelect, allowedExtensions, maxFiles, maxFileSize]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    if (validFiles.length > maxFiles) {
      fileErrors.push(`최대 ${maxFiles}개의 파일만 선택할 수 있습니다.`);
    }

    const finalSelectedFiles = validFiles.slice(0, maxFiles);
    if (finalSelectedFiles.length > 0) {
      onFileSelect(finalSelectedFiles);
    }

    if (fileErrors.length > 0) {
      setErrors(fileErrors);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const clearErrors = () => {
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
