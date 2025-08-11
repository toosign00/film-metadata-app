/**
 * @module services/download/upload
 * 로컬(Blob/data) URL 파일을 서버로 업로드하여 ZIP을 생성하고 응답을 저장합니다.
 */

import { saveAs } from 'file-saver';

/**
 * 서버 응답에서 ZIP Blob을 저장합니다.
 * @param {Response} response - `/api/zip` 응답 객체
 * @param {string} fileName - 저장할 ZIP 파일명
 */
export async function saveZipFromResponse(response: Response, fileName: string): Promise<void> {
  if (!response.ok) {
    throw new Error(`서버 ZIP 요청 실패: ${response.status} ${response.statusText}`);
  }
  const blob = await response.blob();
  saveAs(blob, fileName);
}

/**
 * 로컬 URL을 Blob으로 변환해 FormData로 업로드하고 ZIP 파일을 저장합니다.
 * @param {{ url: string; name: string }[]} localFiles - 로컬(Blob/data) URL 파일 목록
 * @param {{ url: string; name: string }[]} httpFiles - http/https 파일 목록(JSON으로 함께 전송)
 * @param {string} requestId - 서버 진행률 트래킹을 위한 요청 ID
 * @param {string} fileName - 저장할 ZIP 파일명
 */
export async function uploadLocalFilesAndDownloadZip(
  localFiles: Array<{ url: string; name: string }>,
  httpFiles: Array<{ url: string; name: string }>,
  requestId: string,
  fileName: string
): Promise<void> {
  const formData = new FormData();
  if (httpFiles.length > 0) {
    formData.append('files', JSON.stringify(httpFiles));
  }
  for (const f of localFiles) {
    const res = await fetch(f.url);
    const blob = await res.blob();
    const file = new File([blob], f.name, { type: blob.type || 'application/octet-stream' });
    formData.append('files', file);
  }
  formData.append('requestId', requestId);

  const response = await fetch('/api/zip', {
    method: 'POST',
    body: formData,
    cache: 'no-store',
  });
  await saveZipFromResponse(response, fileName);
}
