import { useState } from 'react';
import { naturalSort } from '../utils/sortUtils';
import { processMetadata } from '../utils/metadataUtils';
import { InitialSettings } from '../types/config.type';
import { ProcessResult, UseFileHandlersOptions, UseFileHandlersReturn } from '../types/hooks.type';

/**
 * 파일 처리 관련 로직을 관리하는 커스텀 훅
 * @param {UseFileHandlersOptions} options - 훅 옵션
 * @param {Function} options.onComplete - 처리 완료 시 콜백
 * @returns {UseFileHandlersReturn} 파일 처리 관련 상태와 함수들
 */
export const useFileHandlers = ({ onComplete }: UseFileHandlersOptions): UseFileHandlersReturn => {
  const [files, setFiles] = useState<File[]>([]);
  const [sortedFiles, setSortedFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [errors, setErrors] = useState<{ file: string; error: string }[]>([]);
  const [resultImages, setResultImages] = useState<ProcessResult['images']>([]);

  // 파일 선택 핸들러
  const handleFileSelect = (selectedFiles: File[]): void => {
    setFiles(selectedFiles);
    const sorted = [...selectedFiles].sort(naturalSort);
    setSortedFiles(sorted);
  };

  // 메타데이터 처리 시작 함수
  const processFiles = async (e: React.FormEvent, settings: InitialSettings): Promise<void> => {
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

      const metadataSettings = {
        ...settings,
        startTime: new Date(settings.startTime),
      };

      const results = await processMetadata(
        sortedFiles,
        combinedDateTime,
        metadataSettings,
        (completed: number) => setCompleted(completed),
      );

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
  const resetFiles = (): void => {
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
