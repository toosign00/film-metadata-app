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
