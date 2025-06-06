import { InitialSettings } from './config.type';

export interface ProcessResult {
  images: Array<{
    url: string;
    name: string;
    dateTime?: string;
  }>;
  errors: string[];
}

export interface UseFileHandlersOptions {
  onComplete?: (results: ProcessResult) => void;
}

export interface UseFileHandlersReturn {
  files: File[];
  sortedFiles: File[];
  processing: boolean;
  completed: number;
  errors: string[];
  resultImages: ProcessResult['images'];
  handleFileSelect: (files: File[]) => void;
  processFiles: (e: React.FormEvent, settings: InitialSettings) => Promise<void>;
  resetFiles: () => void;
  setProcessing: (processing: boolean) => void;
}

export interface UseMetadataHandlersReturn {
  settings: InitialSettings;
  handleSettingsChange: (name: keyof InitialSettings, value: InitialSettings[keyof InitialSettings]) => void;
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
  dropAreaRef: React.RefObject<HTMLDivElement | null>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  openFileDialog: () => void;
  errors: string[];
  clearErrors: () => void;
  isMobile: boolean;
  maxFiles: number;
}
