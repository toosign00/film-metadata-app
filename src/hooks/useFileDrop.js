import { useState, useRef, useEffect } from 'react';

/**
 * 파일 드래그 앤 드롭을 위한 커스텀 훅
 * @param {Function} onFileSelect - 파일 선택 콜백 함수
 * @param {Array} allowedExtensions - 허용된 파일 확장자 배열
 */
const useFileDrop = (onFileSelect, allowedExtensions = ['jpg', 'jpeg', 'png']) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);
  
  // 유효한 파일인지 확인하는 헬퍼 함수
  const isValidFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    return allowedExtensions.includes(ext);
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
      
      const droppedFiles = Array.from(e.dataTransfer.files).filter(isValidFile);
      
      if (droppedFiles.length > 0) {
        onFileSelect(droppedFiles);
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
  }, [onFileSelect, allowedExtensions]);

  // 파일 선택 핸들러
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(isValidFile);
    
    if (selectedFiles.length > 0) {
      onFileSelect(selectedFiles);
    }
  };
  
  // 파일 선택 다이얼로그 열기
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return {
    isDragging,
    fileInputRef,
    dropAreaRef,
    handleFileSelect,
    openFileDialog
  };
};

export default useFileDrop;