import { toast } from 'sonner';
import type { Image as AppImage } from '@/types/imageCard.types';

export async function downloadFile(image: AppImage): Promise<void> {
  try {
    if (!image?.url) {
      throw new Error('다운로드할 이미지 정보가 없습니다');
    }

    const response = await fetch(image.url);
    if (!response.ok) {
      throw new Error(`파일 다운로드 실패: ${response.status}`);
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
