/**
 * @module services/download
 * 클라이언트 기반 ZIP 파일 생성 및 다운로드 서비스를 제공합니다.
 *
 * 주요 기능:
 * - 단일 파일 다운로드 (fetch + file-saver)
 * - 다중 파일 ZIP 생성 (fflate 기반 스트리밍)
 * - 모바일 환경 자동 분할 저장 (iOS Safari OOM 방지)
 * - 진행률 실시간 업데이트 및 에러 처리
 */

import { Zip, ZipPassThrough } from 'fflate';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import type { Image as AppImage } from '@/types/imageCard.type';
import type {
  BooleanUpdater,
  DownloadFile,
  ProgressUpdater,
  ServiceError as ServiceErrorShape,
} from '@/types/service.types';

/**
 * HTTP/HTTPS URL인지 검증합니다
 */
function isHttpUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

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
    saveAs(blob, image.name || 'download');
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
 * 클라이언트에서 fflate를 사용하여 스트리밍 방식으로 ZIP을 생성하고,
 * 모바일 환경에서는 메모리 부족을 방지하기 위해 자동으로 파일을 분할하여
 * 여러 개의 ZIP 파일로 저장합니다.
 *
 * @param validImages - ZIP에 포함할 이미지 목록
 * @param updateZipProgress - 진행률 업데이트 콜백 (0-100)
 * @param updateProcessing - 처리 상태 업데이트 콜백
 * @param updateIsZipCompressing - 압축 상태 업데이트 콜백 (선택사항)
 *
 * @throws {Error} ZIP 생성 실패 시
 *
 * @example
 * ```ts
 * await createZipFile(
 *   resultImages,
 *   setZipProgress,
 *   setProcessing,
 *   setZipCompressing
 * );
 * ```
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

    // 파일 목록을 URL 타입별로 분류
    // - httpFiles: 원격 HTTP/HTTPS URL (CORS 허용 필요)
    // - localFiles: 로컬 Blob/Object URL (브라우저 메모리 내)
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

    const allFiles: DownloadFile[] = [...localFiles, ...httpFiles];

    // 브라우저 환경 탐지: iOS Safari는 메모리 제약으로 인해 분할 처리 필요
    const isIOS = (() => {
      if (typeof navigator === 'undefined') return false;
      const ua = navigator.userAgent || navigator.vendor || '';
      return /iPad|iPhone|iPod/.test(ua) || (ua.includes('Mac') && 'ontouchend' in document);
    })();

    // iOS: 최대 30개 파일/ZIP, 데스크톱/안드로이드: 최대 200개 파일/ZIP
    const maxFilesPerZip = isIOS ? 30 : 200;
    const totalFiles = allFiles.length;

    // 파일을 청크 단위로 분할 (메모리 부족 환경 대응)
    const chunks: DownloadFile[][] = [];
    for (let i = 0; i < allFiles.length; i += maxFilesPerZip) {
      chunks.push(allFiles.slice(i, i + maxFilesPerZip));
    }

    let processedCount = 0;

    /**
     * 파일 청크를 ZIP으로 압축하고 다운로드합니다.
     *
     * @param files - 압축할 파일 목록
     * @param chunkIndex - 청크 인덱스 (파일명 생성용)
     */
    const saveChunkAsZip = async (files: DownloadFile[], chunkIndex: number): Promise<void> => {
      // ZIP 파일명 생성: 기본명 + 분할 시 part 번호
      const zipFileBaseName = generateZipFileName().replace(/\.zip$/, '');
      const partSuffix = chunks.length > 1 ? `_part${String(chunkIndex + 1).padStart(2, '0')}` : '';
      const zipFileName = `${zipFileBaseName}${partSuffix}.zip`;

      // ZIP 스트림 처리 상태 관리
      let writerClosed = false;
      const zipChunks: BlobPart[] = [];

      // fflate Zip 인스턴스 생성: 스트리밍 방식으로 ZIP 데이터 처리
      const zip = new Zip((err, data, final) => {
        if (err) {
          throw err;
        }
        // ZIP 데이터 청크 수집 (메모리 안전성 검증 포함)
        if (data && data.byteLength > 0) {
          try {
            const source = data as Uint8Array;
            // ArrayBuffer detached 상태 확인 (메모리 안전성)
            if (source.buffer.byteLength === 0) return;
            const safe = new Uint8Array(source);
            zipChunks.push(safe);
          } catch {
            // 청크 복사 실패 시 무시하고 계속 진행
          }
        }
        // ZIP 생성 완료 시 Blob으로 변환하여 다운로드
        if (final && !writerClosed) {
          writerClosed = true;
          const blob = new Blob(zipChunks, { type: 'application/zip' });
          saveAs(blob, zipFileName);
          // 메모리 해제를 위해 청크 배열 정리
          while (zipChunks.length) zipChunks.pop();
        }
      });

      // 파일을 순차적으로 ZIP에 추가 (동시성 1로 메모리 사용량 제어)
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const entry = new ZipPassThrough(file.name || `file_${index + 1}`);
        zip.add(entry);

        try {
          // 파일 URL에서 데이터 가져오기 (캐시 비활성화)
          const response = await fetch(file.url, { cache: 'no-store' });
          if (!response.ok) {
            throw new Error(`파일 가져오기 실패: ${response.status}`);
          }

          if (!response.body) {
            // Response body가 없는 경우: 전체 Blob으로 대체 (메모리 부담 가능성)
            const fallbackBlob = await response.blob();
            const u8 = new Uint8Array(await fallbackBlob.arrayBuffer());
            entry.push(u8, true);
          } else {
            // Response body가 있는 경우: 스트리밍 방식으로 ZIP에 직접 추가
            const reader = response.body.getReader();
            try {
              while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                if (value && value.byteLength > 0) entry.push(value);
              }
            } finally {
              reader.releaseLock();
            }
            entry.push(new Uint8Array(0), true); // ZIP 엔트리 완료 신호
          }
        } catch (error) {
          // CORS 제한이나 네트워크 오류로 파일 추가 실패 시
          // 빈 엔트리로 추가하여 ZIP 구조는 유지하고 다음 파일로 진행
          console.error('[DownloadService] 파일 추가 실패, 건너뜀:', file.name, error);
          entry.push(new Uint8Array(0), true);
        }

        // 진행률 업데이트 (최소 1%, 최대 99%로 제한)
        processedCount += 1;
        const percent = Math.max(1, Math.round((processedCount / totalFiles) * 100));
        updateZipProgress(Math.min(percent, 99));

        // 가비지 컬렉션을 위한 프레임 양보 (메모리 관리)
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      // ZIP 생성 완료 신호 전송
      zip.end();
      // ZIP 콜백에서 saveAs가 호출될 때까지 잠시 대기
      await new Promise((resolve) => setTimeout(resolve, 0));
    };

    // 청크별로 순차 처리 (메모리 부족 환경에서 안전한 분할 저장)
    for (let c = 0; c < chunks.length; c += 1) {
      // eslint-disable-next-line no-await-in-loop
      await saveChunkAsZip(chunks[c], c);
      // 각 청크 완료 후 30ms 대기하여 가비지 컬렉션 기회 제공
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 30));
    }

    // 모든 청크 처리 완료: 진행률 100% 및 상태 정리
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
