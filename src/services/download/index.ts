/**
 * @module services/download
 * ZIP/파일 다운로드 오케스트레이션 API를 제공합니다.
 */

import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import { submitNativeZipDownload } from '@/services/download/nativeZipDownload';
import { uploadLocalFilesAndDownloadZip } from '@/services/download/uploadAndDownloadZip';
import { startProgressPolling } from '@/services/download/zipProgressPolling';
import type { Image as AppImage } from '@/types/imageCard.type';

type ProgressUpdater = (value: number) => void;
type BooleanUpdater = (value: boolean) => void;

function isHttpUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

function buildTimestamp(): string {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate()
  ).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(
    2,
    '0'
  )}`;
}

/**
 * 단일 파일 다운로드
 */
export async function downloadFile(image: AppImage): Promise<void> {
  try {
    if (!image || !image.url) {
      throw new Error('다운로드할 이미지 정보가 없습니다');
    }
    const res = await fetch(image.url);
    const blob = await res.blob();
    saveAs(blob, image.name || 'download');
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[DownloadService] 파일 다운로드 오류:', error);
    toast.error(`파일 다운로드 중 오류가 발생했습니다: ${msg}`);
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
    updateZipProgress(1);
    updateIsZipCompressing?.(true);

    const httpFiles: Array<{ url: string; name: string }> = [];
    const localFiles: Array<{ url: string; name: string }> = [];

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
      // 폴링은 약간 지연하여 시작하여 404 레이스를 줄임
      let stopPolling: () => void = () => undefined;
      setTimeout(() => {
        const handler = startProgressPolling(requestId, validImages.length, updateZipProgress);
        stopPolling = handler.stop;
      }, 300);
      submitNativeZipDownload(httpFiles, requestId, () => {
        stopPolling();
        updateProcessing(false);
        updateIsZipCompressing?.(false);
        updateZipProgress(100);
        toast.success(`${validImages.length}개 파일을 ZIP으로 다운로드합니다.`);
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
    // 업로드 POST가 먼저 시작되도록 폴링은 지연 시작
    let stopPolling: () => void = () => undefined;
    setTimeout(() => {
      const handler = startProgressPolling(requestId, validImages.length, updateZipProgress);
      stopPolling = handler.stop;
    }, 300);
    const zipName = `film_metadata_${buildTimestamp()}.zip`;
    await uploadLocalFilesAndDownloadZip(localFiles, httpFiles, requestId, zipName);

    stopPolling();
    updateProcessing(false);
    updateIsZipCompressing?.(false);
    updateZipProgress(100);
    toast.success(`${validImages.length}개 파일을 ZIP으로 다운로드합니다.`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[DownloadService] 서버 ZIP 요청 오류:', error);
    toast.error(`ZIP 다운로드 요청 중 오류가 발생했습니다: ${msg}`);
    updateProcessing(false);
    updateIsZipCompressing?.(false);
    updateZipProgress(0);
  }
}
