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
export interface ServiceError extends Error {
  code?: string;
  statusCode?: number;
}
