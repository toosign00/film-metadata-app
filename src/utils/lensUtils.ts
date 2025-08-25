// 렌즈 정보 전처리 함수
export const preprocessLensInfo = (lensInfo: string): string => {
  if (!lensInfo) return '';

  let processed = lensInfo.toLowerCase();
  processed = processed.replace(/f[\s.]+(\d+)/i, 'f$1');

  return processed;
};
