'use client';

import { upload } from '@vercel/blob/client';
import type { UploadedBlobInfo as BlobInfo } from '@/types/api.types';
import type { DownloadFile } from '@/types/service.types';

export async function uploadFileToVercelBlob(
  file: File,
  clientPayload?: string
): Promise<BlobInfo> {
  // 임시 보관 경로로 업로드하여 크론으로 일괄 정리 가능하게 함
  const safeName = file.name.replace(/[^\w.-]+/g, '_');
  const tmpPath = `tmp/${new Date().toISOString().slice(0, 10)}/${Date.now()}_${safeName}`;
  const blob = await upload(tmpPath, file, {
    access: 'public',
    handleUploadUrl: '/api/upload',
    clientPayload,
  });
  return {
    url: blob.url,
    pathname: new URL(blob.url).pathname,
    size: file.size,
    contentType: null,
  };
}

export async function uploadManyToVercelBlob(
  files: File[],
  concurrency: number = 3,
  onProgress?: (completed: number, total: number) => void
): Promise<BlobInfo[]> {
  const results: BlobInfo[] = new Array(files.length);
  let completed = 0;

  const queue = files.map((file, index) => ({ file, index }));
  const workers: Promise<void>[] = [];

  const runWorker = async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;
      const info = await uploadFileToVercelBlob(item.file);
      results[item.index] = info;
      completed += 1;
      onProgress?.(completed, files.length);
    }
  };

  for (let i = 0; i < Math.max(1, concurrency); i += 1) {
    workers.push(runWorker());
  }

  await Promise.all(workers);
  return results;
}

/**
 * 로컬 Blob/Object URL 목록을 받아 Vercel Blob으로 업로드합니다.
 * @param localFiles { url: objectURL, name: string } 목록
 */
export async function uploadLocalBlobUrlsToVercelBlob(
  localFiles: DownloadFile[],
  concurrency: number = 3,
  onProgress?: (completed: number, total: number) => void
): Promise<BlobInfo[]> {
  // object URL은 fetch 가능하다. Blob → File 변환 후 다중 업로드 사용
  const files: File[] = [];
  for (const lf of localFiles) {
    const res = await fetch(lf.url);
    const blob = await res.blob();
    const file = new File([blob], lf.name || 'file', {
      type: blob.type || 'application/octet-stream',
    });
    files.push(file);
  }
  return uploadManyToVercelBlob(files, concurrency, onProgress);
}

/**
 * Vercel Blob URL을 삭제합니다.
 * @param urls 삭제할 Blob URL(들)
 */
export async function deleteVercelBlobs(urls: string | string[]): Promise<void> {
  const urlsArray = Array.isArray(urls) ? urls : [urls];

  // 각 URL을 개별적으로 삭제 (query parameter 방식)
  const deletePromises = urlsArray.map(async (url) => {
    const deleteUrl = `/api/delete?url=${encodeURIComponent(url)}`;
    const response = await fetch(deleteUrl, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Delete failed' }));
      console.error(`Failed to delete blob ${url}:`, error);
      throw new Error(error.error || 'Failed to delete blob');
    }
  });

  // 모든 삭제 작업을 병렬로 실행
  await Promise.all(deletePromises);
}
