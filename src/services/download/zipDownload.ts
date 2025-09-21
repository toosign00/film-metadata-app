import { toast } from 'sonner';
import type { Image as AppImage } from '@/types/imageCard.types';
import type { MetadataResult } from '@/types/metadata.types';
import type { BooleanUpdater, ProgressUpdater } from '@/types/service.types';
import { type FileSystemFileHandle, hasFileSystemAccess } from '../../types/zipDownload.types';
import { generateZipFileName } from '../../utils/zipDownloadUtils';
import { StreamingZipProcessor } from './streamingProcessor';
import { createZipFileFallback } from './zipDownloadFallback';

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

  let fileHandle: FileSystemFileHandle | null = null;

  try {
    updateProcessing(true);
    updateZipProgress(0);

    // 1단계: File System Access API 지원 여부 확인
    if (!hasFileSystemAccess(window)) {
      // 폴백 모드로 전환
      return createZipFileFallback(
        validImages,
        updateZipProgress,
        updateProcessing,
        updateIsZipCompressing
      );
    }

    toast.info('저장할 위치를 선택해주세요.');

    try {
      fileHandle = await window.showSaveFilePicker({
        suggestedName: generateZipFileName(),
        types: [
          {
            description: 'ZIP files',
            accept: { 'application/zip': ['.zip'] },
          },
        ],
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        updateProcessing(false);
        return; // 사용자 취소
      }
      throw error;
    }

    // 2단계: ZIP 생성 시작 안내
    updateZipProgress(1);
    updateIsZipCompressing?.(true);
    toast.info('ZIP 파일을 생성하고 있습니다...');

    // 파일 목록 준비
    const allFiles = validImages.map((img, idx) => {
      const name = (img as AppImage | MetadataResult).name || `image_${idx + 1}.jpg`;
      const file = (img as MetadataResult).file;
      return { file, name };
    });
    const totalFiles = allFiles.length;
    let processedCount = 0;

    // 3단계: 선택된 위치에 스트리밍 ZIP 생성
    const writableStream = await fileHandle.createWritable();

    // 스트리밍 ZIP 처리기 생성
    const processor = new StreamingZipProcessor();
    const zipStream = processor.createStream();

    // ZIP 스트림을 파일로 파이프
    const writePromise = zipStream.pipeTo(writableStream);

    // 파일들을 순차적으로 ZIP에 추가
    for (const { file, name } of allFiles) {
      await processor.addFile(file, name);

      processedCount += 1;
      const percent = Math.max(5, Math.round((processedCount / totalFiles) * 95));
      updateZipProgress(percent);
    }

    // ZIP 완료 및 쓰기 대기
    processor.finish();
    await writePromise;

    updateZipProgress(100);
    updateProcessing(false);
    updateIsZipCompressing?.(false);
    toast.success(`${processedCount}개 파일이 ZIP으로 저장되었습니다.`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[DownloadService] 스트리밍 ZIP 생성 오류:', error);
    toast.error(`ZIP 생성 중 오류가 발생했습니다. ${msg}`);
    updateProcessing(false);
    updateIsZipCompressing?.(false);
    updateZipProgress(0);
  }
}
