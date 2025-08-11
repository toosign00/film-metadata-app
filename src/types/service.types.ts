/**
 * 서비스 레이어 타입 정의
 */

// 다운로드 서비스 타입
export type ProgressUpdater = (value: number) => void;
export type BooleanUpdater = (value: boolean) => void;

export interface DownloadFile {
  url: string;
  name: string;
}

export interface DownloadOptions {
  concurrency?: number;
  onProgress?: (completed: number, total: number) => void;
}

// 업로드 서비스 타입
export interface UploadedBlobInfo {
  url: string;
  pathname: string;
  size: number;
  contentType: string | null;
}

export interface UploadConfig {
  access?: 'public' | 'private';
  handleUploadUrl?: string;
  clientPayload?: string;
}

// ZIP 진행률 폴링 타입
export interface ProgressPollingHandler {
  stop: () => void;
}

// 네이티브 다운로드 타입
export type NativeDownloadPayload = DownloadFile[];

// 에러 타입
export interface ServiceError extends Error {
  code?: string;
  statusCode?: number;
}
