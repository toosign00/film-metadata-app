import type { MetadataSettings } from './metadata.types';

export interface ProcessResult {
  images: Array<{
    url: string;
    name: string;
    dateTime?: string;
  }>;
  errors: { file: string; error: string }[];
}

export interface UseFileHandlersOptions {
  onComplete?: (results: ProcessResult) => void;
}

export interface UseFileHandlersReturn {
  files: File[];
  sortedFiles: File[];
  processing: boolean;
  completed: number;
  errors: { file: string; error: string }[];
  resultImages: ProcessResult['images'];
  handleFileSelect: (files: File[]) => void;
  processFiles: (settings: MetadataSettings) => Promise<void>;
  resetFiles: () => void;
  setProcessing: (processing: boolean) => void;
}

export interface UseMetadataHandlersReturn {
  settings: MetadataSettings;
  handleSettingsChange: (
    name: keyof MetadataSettings,
    value: MetadataSettings[keyof MetadataSettings]
  ) => void;
  resetSettings: () => void;
}

export interface UseFileDropOptions {
  allowedExtensions?: string[];
  maxFileSize?: number;
  maxDesktopFiles?: number;
  maxMobileFiles?: number;
}

export interface UseFileDropReturn {
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  dropAreaRef: React.RefObject<HTMLDivElement | HTMLButtonElement | null>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  openFileDialog: () => void;
  errors: string[];
  clearErrors: () => void;
  isMobile: boolean;
  maxFiles: number;
}
