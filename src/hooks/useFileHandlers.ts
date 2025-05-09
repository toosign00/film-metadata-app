import { useState } from 'react';
import { naturalSort, processMetadata } from '../utils/index';
import { MetadataSettings } from '../config/constants';

interface ProcessedImage {
  file: File;
  url: string;
  name: string;
  dateTime: string;
}

interface ProcessResults {
  images: ProcessedImage[];
  errors: Array<{
    file: string;
    error: string;
  }>;
}

interface UseFileHandlersOptions {
  onComplete?: (results: ProcessResults) => void;
}

interface UseFileHandlersReturn {
  files: File[];
  sortedFiles: File[];
  processing: boolean;
  completed: number;
  errors: string[];
  resultImages: ProcessedImage[];
  handleFileSelect: (selectedFiles: File[]) => void;
  processFiles: (e: React.FormEvent, settings: MetadataSettings) => Promise<void>;
  resetFiles: () => void;
  setProcessing: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useFileHandlers = ({ onComplete }: UseFileHandlersOptions): UseFileHandlersReturn => {
  const [files, setFiles] = useState<File[]>([]);
  const [sortedFiles, setSortedFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [resultImages, setResultImages] = useState<ProcessedImage[]>([]);

  const handleFileSelect = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    const sorted = [...selectedFiles].sort(naturalSort);
    setSortedFiles(sorted);
  };

  const processFiles = async (e: React.FormEvent, settings: MetadataSettings) => {
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
      const combinedDateTime = new Date(settings.startDate);
      const timeDate = new Date(settings.startTime);
      combinedDateTime.setHours(timeDate.getHours(), timeDate.getMinutes(), timeDate.getSeconds());

      const results = await processMetadata(sortedFiles, combinedDateTime, settings, (completed: number) => setCompleted(completed));

      setResultImages(results.images);
      setErrors(results.errors.map((error) => error.error));

      if (results.images.length > 0) {
        onComplete?.(results);
      }
    } catch (error) {
      console.error('Processing error:', error);
    } finally {
      setProcessing(false);
    }
  };

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
