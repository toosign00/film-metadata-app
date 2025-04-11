import { useState, useRef, useEffect } from 'react';
import { isMobile as detectMobile } from 'react-device-detect';

/**
 * 파일 드래그 앤 드롭을 위한 커스텀 훅
 * @param {Function} onFileSelect - 파일 선택 콜백 함수
 * @param {Object} options - 추가 옵션
 * @param {Array} options.allowedExtensions - 허용된 파일 확장자 배열
 * @param {number} options.maxFileSize - 최대 파일 크기 (바이트)
 * @param {number} options.maxDesktopFiles - 데스크톱에서 최대 선택 가능한 파일 수
 * @param {number} options.maxMobileFiles - 모바일에서 최대 선택 가능한 파일 수
 */
const useFileDrop = (
  onFileSelect,
  {
    allowedExtensions = ['jpg', 'jpeg'],
    maxFileSize = 15 * 1024 * 1024, // 15MB
    maxDesktopFiles = 100, // 데스크톱에서 최대 파일 개수 100개로 제한
    maxMobileFiles = 4, // 모바일에서 최대 파일 개수 40개로 제한
  } = {}
) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);
  // react-device-detect를 사용하여 모바일 여부 결정
  const [isMobile, setIsMobile] = useState(detectMobile);
  // react-device-detect의 결과를 기반으로 최대 파일 수 계산
  const maxFiles = isMobile ? maxMobileFiles : maxDesktopFiles;

  // 유효한 파일인지 확인하는 헬퍼 함수
  const validateFile = (file) => {
    const errors = [];
    const ext = file.name.split('.').pop().toLowerCase();

    // 확장자 검사
    if (!allowedExtensions.includes(ext)) {
      errors.push(`지원되지 않는 파일 형식입니다: ${file.name}`);
    }

    // 파일 크기 검사
    if (file.size > maxFileSize) {
      errors.push(`파일 크기가 너무 큽니다: ${file.name} (최대 ${maxFileSize / 1024 / 1024}MB)`);
    }

    return errors;
  };

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

      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = [];
      const fileErrors = [];

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
        fileErrors.push(`최대 ${maxFiles}개의 파일만 선택할 수 있습니다.`);
      }

      const selectedFiles = validFiles.slice(0, maxFiles);
      if (selectedFiles.length > 0) {
        onFileSelect(selectedFiles);
      }

      // 에러가 있다면 상태 업데이트
      if (fileErrors.length > 0) {
        setErrors(fileErrors);
      }
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
  }, [onFileSelect, allowedExtensions, maxFiles, maxFileSize]);

  // 파일 선택 핸들러
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = [];
    const fileErrors = [];

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
      fileErrors.push(`최대 ${maxFiles}개의 파일만 선택할 수 있습니다.`);
    }

    const finalSelectedFiles = validFiles.slice(0, maxFiles);
    if (finalSelectedFiles.length > 0) {
      onFileSelect(finalSelectedFiles);
    }

    // 에러가 있다면 상태 업데이트
    if (fileErrors.length > 0) {
      setErrors(fileErrors);
    }
  };

  // 파일 선택 다이얼로그 열기
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // 에러 초기화
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
