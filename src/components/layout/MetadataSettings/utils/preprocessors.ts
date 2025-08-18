import type { InitialSettings as UiInitialSettings } from '@/types/config.type';
import type { MetadataSettings } from '@/types/metadata.type';
// 렌즈 정보 전처리 함수
export const preprocessLensInfo = (lensInfo: string): string => {
  if (!lensInfo) return '';

  // 소문자로 변환
  let processed = lensInfo.toLowerCase();

  // f 다음의 공백 및 점(.) 제거
  processed = processed.replace(/f[\s.]+(\d+)/i, 'f$1');

  return processed;
};

// 도메인 설정(Date 기반) 매핑
export const toDomainMetadataSettings = (ui: UiInitialSettings): MetadataSettings => {
  return {
    cameraMake: ui.cameraMake,
    cameraModel: ui.cameraModel,
    filmInfo: ui.filmInfo,
    lens: ui.lens,
    lensInfo: ui.lensInfo,
    isoValue: ui.isoValue,
    startDate: ui.startDate,
    startTime: new Date(ui.startTime),
  };
};
