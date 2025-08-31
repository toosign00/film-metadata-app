/**
 * @module services/download/downloadErrors
 * 다운로드 서비스 전용 에러 클래스
 */

import type { ServiceError as ServiceErrorShape } from '@/types/service.types';

/**
 * 다운로드 서비스 전용 에러 클래스
 */
export class DownloadServiceError extends Error implements ServiceErrorShape {
  code?: string;
  statusCode?: number;

  constructor(message: string, options?: { code?: string; statusCode?: number }) {
    super(message);
    this.name = 'DownloadServiceError';
    this.code = options?.code;
    this.statusCode = options?.statusCode;
  }
}
