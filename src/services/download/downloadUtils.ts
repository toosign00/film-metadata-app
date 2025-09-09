/**
 * @module services/download/downloadUtils
 * 다운로드 서비스 유틸리티 함수들
 */

/**
 * ZIP 파일명을 타임스탬프와 함께 생성
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
