/**
 * API 공통 타입 정의
 */

// 공통 API 응답 타입
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// API 에러 응답 타입
export interface ApiErrorResponse {
  success: false;
  error: string;
  statusCode?: number;
}

// ZIP 관련 타입
export interface ZipInputFile {
  url: string;
  name: string;
}

export interface ZipProgressEntry {
  processed: number;
  total: number;
  done: boolean;
  error?: string;
}

// Blob 업로드 관련 타입
export interface UploadedBlobInfo {
  url: string;
  pathname: string;
  size: number;
  contentType: string | null;
}

// Blob 삭제 관련 타입
export interface BlobDeleteResponse {
  success: true;
  deletedCount: number;
  message: string;
}

// 파일 검증 설정
export interface FileValidationConfig {
  allowedContentTypes: string[];
  maximumSizeInBytes: number;
  addRandomSuffix?: boolean;
}
