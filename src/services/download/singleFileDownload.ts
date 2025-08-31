/**
 * @module services/download/singleFileDownload
 * 단일 파일 다운로드 기능
 */

import { toast } from 'sonner';
import type { Image as AppImage } from '@/types/imageCard.type';
import { DownloadServiceError } from './downloadErrors';

/**
 * 단일 이미지 파일을 브라우저 기본 다운로드로 다운로드
 * 개별 파일은 메모리 압박이 적으므로 편의성을 위해 브라우저 다운로드 폴더로 자동 저장
 *
 * @param image - 다운로드할 이미지 정보
 */
export async function downloadFile(image: AppImage): Promise<void> {
  try {
    if (!image?.url) {
      throw new DownloadServiceError('다운로드할 이미지 정보가 없습니다', {
        code: 'MISSING_IMAGE_INFO',
      });
    }

    const response = await fetch(image.url);
    if (!response.ok) {
      throw new DownloadServiceError(`파일 다운로드 실패: ${response.status}`, {
        code: 'FETCH_FAILED',
        statusCode: response.status,
      });
    }

    const blob = await response.blob();
    const filename = image.name || 'download';

    // 브라우저 기본 다운로드 (다운로드 폴더로 자동 저장)
    const { saveAs } = await import('file-saver');
    saveAs(blob, filename);

    toast.success('다운로드가 완료되었습니다.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[DownloadService] 파일 다운로드 오류:', error);
    toast.error(`파일 다운로드 중 오류가 발생했습니다. ${message}`);
    throw error;
  }
}
