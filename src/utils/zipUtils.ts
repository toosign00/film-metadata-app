/**
 * ZIP 관련 유틸리티 함수들
 */

import { type Zip, ZipPassThrough } from 'fflate';
import type { ZipInputFile, ZipProgressEntry } from '@/types/api.types';
import { isHttpUrl } from '@/utils/apiUtils';

/**
 * ZIP 파일명을 타임스탬프와 함께 생성합니다
 */
export function generateZipFileName(): string {
  const now = new Date();
  const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(
    2,
    '0'
  )}`;
  return `film_metadata_${timestamp}.zip`;
}

/**
 * 요청 ID를 생성합니다
 */
export function generateRequestId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(36).slice(2)}`
  );
}

/**
 * 파일을 ZIP 엔트리로 추가합니다
 */
export async function addFileToZip(
  zip: Zip,
  file: ZipInputFile,
  progressStore: Map<string, ZipProgressEntry>,
  requestId: string
): Promise<void> {
  const entry = new ZipPassThrough(file.name || 'file');
  zip.add(entry);

  try {
    const url = new URL(file.url);
    if (!isHttpUrl(file.url)) {
      throw new Error(`Unsupported URL scheme: ${url.protocol}`);
    }

    const response = await fetch(file.url, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FilmMetadataApp/1.0)',
      },
      signal: AbortSignal.timeout(30000), // 30초 타임아웃
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${file.url}: ${response.status} ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error(`No response body from ${file.url}`);
    }

    const reader = response.body.getReader();
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value && value.byteLength > 0) {
          entry.push(value);
        }
      }
    } finally {
      reader.releaseLock();
    }

    entry.push(new Uint8Array(0), true);

    // 진행률 업데이트
    const progress = progressStore.get(requestId);
    if (progress) {
      progressStore.set(requestId, {
        ...progress,
        processed: Math.min(progress.processed + 1, progress.total),
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const progress = progressStore.get(requestId);
    if (progress) {
      progressStore.set(requestId, {
        ...progress,
        error: errorMessage,
        done: true,
      });
    }
    throw error;
  }
}

/**
 * 업로드된 파일을 ZIP 엔트리로 추가합니다
 */
export async function addUploadedFileToZip(
  zip: Zip,
  file: File,
  progressStore: Map<string, ZipProgressEntry>,
  requestId: string
): Promise<void> {
  const entry = new ZipPassThrough(file.name || 'file');
  zip.add(entry);

  try {
    const buffer = await file.arrayBuffer();
    entry.push(new Uint8Array(buffer), true);

    // 진행률 업데이트
    const progress = progressStore.get(requestId);
    if (progress) {
      progressStore.set(requestId, {
        ...progress,
        processed: Math.min(progress.processed + 1, progress.total),
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const progress = progressStore.get(requestId);
    if (progress) {
      progressStore.set(requestId, {
        ...progress,
        error: errorMessage,
        done: true,
      });
    }
    throw error;
  }
}
