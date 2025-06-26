/**
 * 데이터 변환 관련 유틸리티 함수
 */

/**
 * Data URI를 Blob으로 변환하는 유틸 함수
 * @param {string} dataURI - 변환할 Data URI 문자열
 * @param {string} type - MIME 타입
 * @returns {Blob} 변환된 Blob 객체
 */
export const dataURItoBlob = (dataURI: string, type: string): Blob => {
  const byteString = atob(dataURI.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ab], { type });
};

/**
 * Blob을 메모리 효율적으로 처리하는 함수
 * @param {Blob} blob - 처리할 Blob 객체
 * @param {Function} processor - Uint8Array를 처리할 콜백 함수
 * @param {number} chunkSize - 청크 크기 (바이트 단위, 기본값 2MB)
 */
export const processBlobInChunks = async (
  blob: Blob,
  processor: (chunk: Uint8Array, offset: number) => Promise<void>,
  chunkSize: number = 2 * 1024 * 1024,
): Promise<void> => {
  const fileSize = blob.size;
  let offset = 0;

  while (offset < fileSize) {
    const chunk = blob.slice(offset, offset + chunkSize);
    const arrayBuffer = await chunk.arrayBuffer();
    await processor(new Uint8Array(arrayBuffer), offset);
    offset += chunkSize;

    // 가비지 컬렉션 기회 제공
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
};
