/**
 * API 유틸리티 함수들
 */

import { NextResponse } from 'next/server';
import type { ApiErrorResponse, ApiResponse } from '@/types/api.types';

/**
 * 성공 응답을 생성합니다
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(message && { message }),
  };
  return NextResponse.json(response, { status });
}

/**
 * 에러 응답을 생성합니다
 */
export function createErrorResponse(error: string, status: number = 400): NextResponse {
  const response: ApiErrorResponse = {
    success: false,
    error,
    statusCode: status,
  };
  return NextResponse.json(response, { status });
}

/**
 * 예외를 처리하고 적절한 에러 응답을 반환합니다
 */
export function handleApiError(
  error: unknown,
  defaultMessage: string = 'Internal server error'
): NextResponse {
  console.error('API Error:', error);

  const errorMessage = error instanceof Error ? error.message : defaultMessage;
  const status =
    error instanceof Error && 'status' in error
      ? (error as Error & { status: number }).status
      : 500;

  return createErrorResponse(errorMessage, status);
}

/**
 * Vercel Blob URL인지 검증합니다
 */
export function isVercelBlobUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('blob.vercel-storage.com');
  } catch {
    return false;
  }
}

/**
 * HTTP/HTTPS URL인지 검증합니다
 */
export function isHttpUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * 파일 크기를 읽기 쉬운 형태로 변환합니다
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}
