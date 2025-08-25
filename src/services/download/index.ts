/**
 * @module services/download
 * 클라이언트 기반 ZIP 파일 생성 및 다운로드 서비스를 제공합니다.
 *
 * 주요 기능:
 * - 단일 파일 다운로드 (fetch + file-saver)
 * - 다중 파일 ZIP 생성 (fflate 기반 스트리밍)
 * - 메모리 효율적인 청크 단위 처리
 * - 진행률 실시간 업데이트 및 에러 처리
 */

import { Zip, ZipPassThrough } from 'fflate';
import { saveAs } from 'file-saver';
import { isChrome, isIOS } from 'react-device-detect';
import { toast } from 'sonner';

/**
 * iOS Chrome 여부를 확인합니다.
 */
const isIOSChrome = isIOS && isChrome;

/**
 * iOS Chrome에서 안전하게 파일을 다운로드합니다.
 * saveAs가 실패하는 경우 새 창에서 열기로 대체합니다.
 */
function safeDownload(blob: Blob, filename: string): void {
  if (isIOSChrome) {
    // iOS Chrome: <a> 태그 + download 속성 시도
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    // DOM에 추가하여 클릭 이벤트 정상 동작 보장
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // URL 해제 (메모리 정리)
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 5000);
  } else {
    // 다른 브라우저: 기본 saveAs 사용
    saveAs(blob, filename);
  }
}

import type { Image as AppImage } from '@/types/imageCard.type';
import type { MetadataResult } from '@/types/metadata.type';
import type {
  BooleanUpdater,
  ProgressUpdater,
  ServiceError as ServiceErrorShape,
} from '@/types/service.types';

/**
 * ZIP 파일명을 타임스탬프와 함께 생성합니다
 */
function generateZipFileName(): string {
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
 * 단일 이미지 파일을 다운로드합니다.
 *
 * @param image - 다운로드할 이미지 정보 (url, name 포함)
 * @throws {DownloadServiceError} 이미지 정보 누락 또는 다운로드 실패 시
 *
 * @example
 * ```ts
 * await downloadFile({ url: 'blob:...', name: 'image.jpg' });
 * ```
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
    safeDownload(blob, image.name || 'download');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[DownloadService] 파일 다운로드 오류:', error);
    toast.error(`파일 다운로드 중 오류가 발생했습니다: ${message}`);
    throw error;
  }
}

/**
 * 다운로드 서비스 전용 에러 클래스입니다.
 *
 * @extends Error
 * @implements ServiceError
 */
class DownloadServiceError extends Error implements ServiceErrorShape {
  code?: string;
  statusCode?: number;

  constructor(message: string, options?: { code?: string; statusCode?: number }) {
    super(message);
    this.name = 'DownloadServiceError';
    this.code = options?.code;
    this.statusCode = options?.statusCode;
  }
}

/**
 * 다중 이미지 파일을 ZIP으로 압축하여 다운로드합니다.
 *
 * 클라이언트에서 fflate를 사용하여 메모리 효율적인 방식으로 ZIP을 생성합니다.
 * 파일을 64KB 청크 단위로 처리하여 메모리 사용량을 최소화합니다.
 *
 * @param validImages - ZIP에 포함할 이미지 목록
 * @param updateZipProgress - 진행률 업데이트 콜백 (0-100)
 * @param updateProcessing - 처리 상태 업데이트 콜백
 * @param updateIsZipCompressing - 압축 상태 업데이트 콜백 (선택사항)
 *
 * @throws {Error} ZIP 생성 실패 시
 */
export async function createZipFile(
  validImages: (AppImage | MetadataResult)[],
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

    // 파일 목록 준비 (이미 보유한 File이 있다면 그것을 사용)
    const allFiles: { file: File; name: string }[] = await Promise.all(
      validImages.map(async (img, idx) => {
        const name = (img as AppImage | MetadataResult).name || `image_${idx + 1}.jpg`;
        const maybeFile: File | undefined = (img as MetadataResult).file;
        if (maybeFile instanceof File) {
          return { file: maybeFile, name };
        }
        // File이 없고 URL만 있는 경우에는 blob으로 대체 (fallback)
        try {
          const res = await fetch((img as AppImage | MetadataResult).url, { cache: 'no-store' });
          const blob = await res.blob();
          return {
            file: new File([blob], name, { type: blob.type || 'application/octet-stream' }),
            name,
          };
        } catch {
          // 실패 시 더미 빈 파일로 대체하여 구조 유지
          return { file: new File([new Uint8Array(0)], name), name };
        }
      })
    );

    const totalFiles = allFiles.length;
    let processedCount = 0;

    // 단일 ZIP 파일로 메모리 효율적 다운로드
    const zipFileName = generateZipFileName();
    let writerClosed = false;
    const zipChunks: BlobPart[] = [];

    const zip = new Zip((err, data, final) => {
      if (err) throw err;
      if (data && data.byteLength > 0) {
        zipChunks.push(new Uint8Array(data));
      }
      if (final && !writerClosed) {
        writerClosed = true;
        const blob = new Blob(zipChunks, { type: 'application/zip' });
        safeDownload(blob, zipFileName);
      }
    });

    // 파일들을 순차적으로 ZIP에 추가 (메모리 사용량 최소화)
    for (let index = 0; index < allFiles.length; index += 1) {
      const { file, name } = allFiles[index];
      const entry = new ZipPassThrough(name || `file_${index + 1}`);
      zip.add(entry);

      try {
        // 파일을 작은 청크로 나누어 스트리밍
        const chunkSize = 64 * 1024; // 64KB씩 처리
        let offset = 0;
        while (offset < file.size) {
          const slice = file.slice(offset, offset + chunkSize);
          const buf = new Uint8Array(await slice.arrayBuffer());
          if (buf.byteLength > 0) entry.push(buf);
          offset += chunkSize;

          // 메모리 해제를 위한 프레임 양보
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => setTimeout(r, 0));
        }
        entry.push(new Uint8Array(0), true);
      } catch (error) {
        console.error('[DownloadService] 파일 추가 실패:', name, error);
        entry.push(new Uint8Array(0), true);
      }

      processedCount += 1;
      const percent = Math.max(1, Math.round((processedCount / totalFiles) * 100));
      updateZipProgress(Math.min(percent, 99));

      // 매 5개 파일마다 메모리 정리 시간 제공
      if (index % 5 === 0) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 10));
      }
    }

    zip.end();
    updateZipProgress(100);
    updateProcessing(false);
    updateIsZipCompressing?.(false);
    toast.success(`${processedCount}개 파일을 ZIP으로 다운로드했습니다.`);
  } catch (error) {
    // 에러 발생 시 상태 롤백 및 사용자에게 알림
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[DownloadService] 클라이언트 ZIP 생성 오류:', error);
    toast.error(`ZIP 생성 중 오류가 발생했습니다: ${msg}`);
    updateProcessing(false);
    updateIsZipCompressing?.(false);
    updateZipProgress(0);
  }
}
