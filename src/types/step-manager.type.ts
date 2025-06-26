import type { MetadataSettings as MetadataSettingsType } from './metadata.type';
import type { MetadataResult } from './metadata.type';

export interface StepManagerProps {
  onComplete?: (results: MetadataResult[]) => void;
}

export interface FileHandlersResult {
  files: File[];
  sortedFiles: File[];
  processing: boolean;
  completed: number;
  errors: Array<{ file: string; error: string }>;
  resultImages: MetadataResult[];
  handleFileSelect: (files: File[]) => void;
  processFiles: (e: React.FormEvent, settings: MetadataSettingsType) => Promise<void>;
  resetFiles: () => void;
  setProcessing: (processing: boolean) => void;
}

export interface MetadataHandlersResult {
  settings: MetadataSettingsType;
  handleSettingsChange: (name: string, value: any) => void;
  resetSettings: () => void;
}
