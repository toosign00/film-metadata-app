/**
 * @module services/download/zipDownload
 * ZIP 다운로드 메인 로직
 */

import { toast } from 'sonner';
import type { Image as AppImage } from '@/types/imageCard.type';
import type { MetadataResult } from '@/types/metadata.type';
import type { BooleanUpdater, ProgressUpdater } from '@/types/service.types';
import { DownloadServiceError } from './downloadErrors';
import { type FileSystemFileHandle, hasFileSystemAccess } from './downloadTypes';
import { generateZipFileName } from './downloadUtils';
import { StreamingZipProcessor } from './streamingProcessor';

/**
 * 다중 이미지 파일을 ZIP으로 압축하여 스트리밍 다운로드
 * 1단계: 사용자가 저장 위치 선택
 * 2단계: ZIP 생성 및 실시간 저장
 *
 * @param validImages - ZIP에 포함할 이미지 목록
 * @param updateZipProgress - 진행률 업데이트 콜백 (0-100)
 * @param updateProcessing - 처리 상태 업데이트 콜백
 * @param updateIsZipCompressing - 압축 상태 업데이트 콜백 (선택사항)
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

  let fileHandle: FileSystemFileHandle | null = null;

  try {
    updateProcessing(true);
    updateZipProgress(0);

    // 1단계: 사용자가 저장 위치 선택
    if (!hasFileSystemAccess(window)) {
      throw new DownloadServiceError(
        'File System Access API를 지원하지 않는 브라우저입니다. Chrome, Edge, Opera 최신 버전을 사용해주세요.',
        { code: 'UNSUPPORTED_BROWSER' }
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
    const filePromises = validImages.map(async (img, idx) => {
      const name = (img as AppImage | MetadataResult).name || `image_${idx + 1}.jpg`;
      const maybeFile = (img as MetadataResult).file;

      if (maybeFile instanceof File) {
        return { file: maybeFile, name };
      }

      // URL에서 파일 생성
      try {
        const res = await fetch((img as AppImage | MetadataResult).url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const blob = await res.blob();
        return {
          file: new File([blob], name, { type: blob.type || 'application/octet-stream' }),
          name,
        };
      } catch (error) {
        console.warn('[StreamingZip] 파일 로드 실패:', name, error);
        return {
          file: new File([new Uint8Array(0)], name, { type: 'application/octet-stream' }),
          name,
        };
      }
    });

    const allFiles = await Promise.all(filePromises);
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

      // 백프레셔 처리: 5개마다 약간의 지연
      if (processedCount % 5 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
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
