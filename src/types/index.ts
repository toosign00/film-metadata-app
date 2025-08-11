export interface BaseResponse<T> {
  data: T;
  status: number;
  message: string;
}

// 메타데이터 관련 타입 정의
export interface FilmMetadata {
  title: string;
  date: string;
  location: string;
  description?: string;
  tags?: string[];
}

// 컴포넌트 Props 타입 정의
export interface LayoutProps {
  children: React.ReactNode;
}

// API 응답 타입 정의
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// ErrorDisplay 컴포넌트 타입 정의
export interface ErrorItem {
  file: string;
  error: string;
}

export interface ErrorDisplayProps {
  errors: ErrorItem[];
}

// FileSelection 컴포넌트 타입 정의
export interface File {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export interface FileSelectionProps {
  activeStep: number;
  onFileSelect: (files: File[]) => void;
  sortedFiles: File[];
  goToStep: (step: number) => void;
  resetForm: () => void;
}

// UI 컴포넌트 타입 정의
export interface ButtonProps {
  variant: 'primary' | 'text';
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export interface DropZoneProps {
  onFileSelect: (files: File[]) => void;
  filesCount: number;
}

export interface FileListProps {
  files: File[];
}

// 청크 업로드 관련 타입 정의
export interface ChunkUploadProgress {
  uploadedChunks: number;
  totalChunks: number;
  progress: number;
  isComplete: boolean;
}

export interface ChunkUploadOptions {
  chunkSize?: number;
  maxRetries?: number;
  retryDelay?: number;
}
