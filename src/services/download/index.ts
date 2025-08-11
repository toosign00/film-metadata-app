/**
 * @module services/download
 * ZIP/파일 다운로드 오케스트레이션 API를 제공합니다.
 */

import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import { submitNativeZipDownload } from '@/services/download/nativeZipDownload';
import { startProgressPolling } from '@/services/download/zipProgressPolling';
import { deleteVercelBlobs, uploadLocalBlobUrlsToVercelBlob } from '@/services/upload/blobUpload';
import type { Image as AppImage } from '@/types/imageCard.type';
import type { BooleanUpdater, DownloadFile, ProgressUpdater } from '@/types/service.types';
import { isHttpUrl } from '@/utils/apiUtils';

// timestamp util은 현재 미사용

/**
 * 단일 파일 다운로드
 */
export async function downloadFile(image: AppImage): Promise<void> {
  try {
    if (!image?.url) {
      throw new ServiceError('다운로드할 이미지 정보가 없습니다', { code: 'MISSING_IMAGE_INFO' });
    }

    const response = await fetch(image.url);
    if (!response.ok) {
      throw new ServiceError(`파일 다운로드 실패: ${response.status}`, {
        code: 'FETCH_FAILED',
        statusCode: response.status,
      });
    }

    const blob = await response.blob();
    saveAs(blob, image.name || 'download');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[DownloadService] 파일 다운로드 오류:', error);
    toast.error(`파일 다운로드 중 오류가 발생했습니다: ${message}`);
    throw error;
  }
}

/**
 * ServiceError 클래스
 */
class ServiceError extends Error implements ServiceError {
  code?: string;
  statusCode?: number;

  constructor(message: string, options?: { code?: string; statusCode?: number }) {
    super(message);
    this.name = 'ServiceError';
    this.code = options?.code;
    this.statusCode = options?.statusCode;
  }
}

/**
 * ZIP 다운로드(서버 스트리밍) 오케스트레이션
 */
export async function createZipFile(
  validImages: AppImage[],
  updateZipProgress: ProgressUpdater,
  updateProcessing: BooleanUpdater,
  updateIsZipCompressing?: BooleanUpdater
): Promise<void> {
  if (!validImages || validImages.length === 0) {
    toast.error('다운로드할 이미지가 없습니다.');
    return;
  }

  try {
    updateProcessing(true);
    updateZipProgress(0);
    updateIsZipCompressing?.(true);

    const httpFiles: DownloadFile[] = [];
    const localFiles: DownloadFile[] = [];

    validImages.forEach((img, idx) => {
      const name = img.name || `image_${idx + 1}.jpg`;
      if (isHttpUrl(img.url)) {
        httpFiles.push({ url: img.url, name });
      } else {
        localFiles.push({ url: img.url, name });
      }
    });

    if (localFiles.length === 0) {
      const requestId =
        crypto.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(36).slice(2)}`;
      // HTTP 파일만 있는 경우 전체 범위(0~95%)로 폴링
      let stopPolling: () => void = () => undefined;
      setTimeout(() => {
        const handler = startProgressPolling(
          requestId,
          validImages.length,
          updateZipProgress,
          0,
          95
        );
        stopPolling = handler.stop;
      }, 300);
      submitNativeZipDownload(httpFiles, requestId, () => {
        stopPolling();
        updateProcessing(false);
        updateIsZipCompressing?.(false);
        updateZipProgress(100);
        toast.success(`${validImages.length}개 파일을 ZIP으로 다운로드를 시작합니다.`);
      });
      setTimeout(() => {
        stopPolling();
        updateIsZipCompressing?.(false);
        updateProcessing(false);
      }, 120000);
      return;
    }

    const requestId =
      crypto.randomUUID?.() ?? `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    // 업로드 완료 후 ZIP 진행률 폴링 시작 (50%~95% 범위)
    let stopPolling: () => void = () => undefined;

    // 1) 로컬 Blob URL을 Vercel Blob으로 업로드 (0-50% 범위)
    const uploaded = await uploadLocalBlobUrlsToVercelBlob(localFiles, 3, (completed, total) => {
      const uploadProgress = Math.round((completed / total) * 50); // 업로드가 전체의 50%
      updateZipProgress(uploadProgress);
    });

    // 업로드 완료 후 ZIP 폴링 시작 (50%~95% 범위)
    setTimeout(() => {
      const handler = startProgressPolling(
        requestId,
        validImages.length,
        updateZipProgress,
        50,
        95
      );
      stopPolling = handler.stop;
    }, 300);

    // 2) 업로드된 URL + 기존 http 파일로 서버 ZIP 스트리밍(네이티브 폼 경로)
    const filesForZip = [
      ...httpFiles,
      ...uploaded.map((u, idx) => ({
        url: u.url,
        name: localFiles[idx]?.name || `file_${idx + 1}`,
      })),
    ];
    submitNativeZipDownload(filesForZip, requestId, () => {
      stopPolling();
      updateProcessing(false);
      updateIsZipCompressing?.(false);
      updateZipProgress(100);
      toast.success(`${validImages.length}개 파일을 ZIP으로 다운로드합니다.`);

      // 3) 다운로드 완료 후 정리 작업
      // Object URL은 컴포넌트 언마운트 시 해제하도록 변경

      // 업로드된 Vercel Blob 즉시 삭제 (서버에서 다운로드 완료 시 삭제 처리)
      if (uploaded.length > 0) {
        const blobUrls = uploaded.map((u) => u.url);
        deleteVercelBlobs(blobUrls).catch((error) => {
          console.error('Failed to cleanup uploaded blobs:', error);
          // 삭제 실패는 사용자에게 알리지 않음 (백그라운드 정리 작업)
        });
      }
    });

    // 안전 타임아웃
    setTimeout(() => {
      stopPolling();
      updateIsZipCompressing?.(false);
      updateProcessing(false);
    }, 120000);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[DownloadService] 서버 ZIP 요청 오류:', error);
    toast.error(`ZIP 다운로드 요청 중 오류가 발생했습니다: ${msg}`);
    updateProcessing(false);
    updateIsZipCompressing?.(false);
    updateZipProgress(0);
  }
}
