import { Zip, ZipPassThrough } from 'fflate';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';
import type { Image as AppImage } from '@/types/imageCard.types';
import type { MetadataResult } from '@/types/metadata.types';
import type { BooleanUpdater, ProgressUpdater } from '@/types/service.types';
import { generateZipFileName } from '../../utils/zipDownloadUtils';

export async function createZipFileFallback(
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

    // 파일 목록 준비
    const allFiles: { file: File; name: string }[] = validImages.map((img, idx) => {
      const name = (img as AppImage | MetadataResult).name || `image_${idx + 1}.jpg`;
      const file = (img as MetadataResult).file;
      return { file, name };
    });

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
        saveAs(blob, zipFileName);
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
        }
        entry.push(new Uint8Array(0), true);
      } catch (error) {
        console.error('[DownloadService] 파일 추가 실패:', name, error);
        entry.push(new Uint8Array(0), true);
      }

      processedCount += 1;
      const percent = Math.max(1, Math.round((processedCount / totalFiles) * 100));
      updateZipProgress(Math.min(percent, 99));
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
