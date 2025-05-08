import { useState } from 'react';
import { naturalSort } from '../utils';
import { processMetadata } from '../utils/metadataUtils';

/**
 * 파일 처리 관련 로직을 관리하는 커스텀 훅
 * @param {Object} options - 훅 옵션
 * @param {Function} options.onComplete - 처리 완료 시 콜백
 * @returns {Object} 파일 처리 관련 상태와 함수들
 */
export const useFileHandlers = ({ onComplete }) => {
  const [files, setFiles] = useState([]);
  const [sortedFiles, setSortedFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [errors, setErrors] = useState([]);
  const [resultImages, setResultImages] = useState([]);

  // 파일 선택 핸들러
  const handleFileSelect = (selectedFiles) => {
    setFiles(selectedFiles);
    const sorted = [...selectedFiles].sort(naturalSort);
    setSortedFiles(sorted);
  };

  // 메타데이터 처리 시작 함수
  const processFiles = async (e, settings) => {
    e.preventDefault();

    if (sortedFiles.length === 0) {
      alert('처리할 파일을 선택해주세요.');
      return;
    }

    setProcessing(true);
    setCompleted(0);
    setErrors([]);
    setResultImages([]);

    try {
      // 날짜와 시간을 하나의 Date 객체로 합치기
      const combinedDateTime = new Date(settings.startDate);
      const timeDate = new Date(settings.startTime);
      combinedDateTime.setHours(timeDate.getHours(), timeDate.getMinutes(), timeDate.getSeconds());

      const results = await processMetadata(sortedFiles, combinedDateTime, settings, (completed) => setCompleted(completed));

      setResultImages(results.images);
      setErrors(results.errors);

      // 처리 완료 후 콜백 실행
      if (results.images.length > 0) {
        onComplete?.(results);
      }
    } catch (error) {
      console.error('Processing error:', error);
    } finally {
      setProcessing(false);
    }
  };

  // 초기화 함수
  const resetFiles = () => {
    setFiles([]);
    setSortedFiles([]);
    setResultImages([]);
    setErrors([]);
    setCompleted(0);
  };

  return {
    files,
    sortedFiles,
    processing,
    completed,
    errors,
    resultImages,
    handleFileSelect,
    processFiles,
    resetFiles,
    setProcessing,
  };
};
