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
// (제거됨) UploadedBlobInfo, UploadConfig: Vercel Blob 의존성 제거

// ZIP 진행률 폴링 타입
// (제거됨) ProgressPollingHandler: 서버 폴링 제거

// 네이티브 다운로드 타입
// (제거됨) NativeDownloadPayload: iframe 기반 네이티브 다운로드 제거

// 에러 타입
export interface ServiceError extends Error {
  code?: string;
  statusCode?: number;
}
