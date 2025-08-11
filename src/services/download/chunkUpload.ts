/**
 * @module services/download/chunkUpload
 * 파일을 청크로 분할하고 순차적으로 업로드하는 서비스
 */

export interface ChunkUploadProgress {
  uploadedChunks: number;
  totalChunks: number;
  progress: number;
  isComplete: boolean;
}

export class ChunkUploader {
  private readonly CHUNK_SIZE = 1024 * 1024; // 1MB 청크

  /**
   * 파일을 청크로 분할합니다.
   * @param file - 분할할 파일
   * @returns 청크 배열
   */
  async splitFile(file: File): Promise<Blob[]> {
    const chunks: Blob[] = [];
    let start = 0;

    while (start < file.size) {
      const end = Math.min(start + this.CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);
      chunks.push(chunk);
      start = end;
    }

    return chunks;
  }

  /**
   * 청크들을 순차적으로 업로드합니다.
   * @param fileId - 파일 식별자
   * @param chunks - 청크 배열
   * @param onProgress - 진행률 콜백
   */
  async uploadChunks(
    fileId: string,
    chunks: Blob[],
    onProgress?: (progress: ChunkUploadProgress) => void
  ): Promise<void> {
    for (let i = 0; i < chunks.length; i++) {
      const formData = new FormData();
      formData.append('fileId', fileId);
      formData.append('chunkIndex', i.toString());
      formData.append('totalChunks', chunks.length.toString());
      formData.append('chunk', chunks[i]);

      const response = await fetch('/api/upload-chunk', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`청크 ${i} 업로드 실패: ${response.status}`);
      }

      // 진행률 업데이트
      onProgress?.({
        uploadedChunks: i + 1,
        totalChunks: chunks.length,
        progress: ((i + 1) / chunks.length) * 100,
        isComplete: false,
      });
    }

    // 모든 청크 업로드 완료 후 병합 요청
    const mergeResponse = await fetch('/api/merge-chunks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileId }),
    });

    if (!mergeResponse.ok) {
      throw new Error(`청크 병합 실패: ${mergeResponse.status}`);
    }

    onProgress?.({
      uploadedChunks: chunks.length,
      totalChunks: chunks.length,
      progress: 100,
      isComplete: true,
    });
  }

  /**
   * 로컬 URL 파일들을 청크로 분할하고 업로드합니다.
   * @param localFiles - 로컬 URL 파일 목록
   * @param onProgress - 진행률 콜백
   */
  async uploadLocalFiles(
    localFiles: Array<{ url: string; name: string }>,
    onProgress?: (progress: ChunkUploadProgress) => void
  ): Promise<string[]> {
    const fileIds: string[] = [];

    for (const fileInfo of localFiles) {
      const response = await fetch(fileInfo.url);
      const blob = await response.blob();
      const file = new File([blob], fileInfo.name, {
        type: blob.type || 'application/octet-stream',
      });

      const fileId = crypto.randomUUID();
      const chunks = await this.splitFile(file);

      await this.uploadChunks(fileId, chunks, onProgress);
      fileIds.push(fileId);
    }

    return fileIds;
  }
}
