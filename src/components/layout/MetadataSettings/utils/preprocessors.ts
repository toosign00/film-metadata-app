/**
 * 렌즈 정보 전처리 함수
 * @param lensInfo - 원본 렌즈 정보 문자열
 * @returns 처리된 렌즈 정보 문자열
 */
export const preprocessLensInfo = (lensInfo: string): string => {
  if (!lensInfo) return '';

  // 소문자로 변환
  let processed = lensInfo.toLowerCase();

  // f 다음의 공백 및 점(.) 제거
  processed = processed.replace(/f[\s.]+(\d+)/i, 'f$1');

  return processed;
};
