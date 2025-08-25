import type { MetadataSettings } from '@/types/metadata.type';
/**
 * 초기 메타데이터 설정값
 */

export const INITIAL_SETTINGS: MetadataSettings = {
  startDate: new Date(),
  startTime: (() => {
    const t = new Date();
    t.setHours(8, 0, 0, 0);
    return t;
  })(),
  cameraMake: '',
  cameraModel: '',
  filmInfo: '',
  lens: '',
  lensInfo: '',
  isoValue: '',
};

/**
 * 단계 상수
 */
export interface Steps {
  FILE_SELECTION: number;
  METADATA_SETTINGS: number;
  RESULTS_VIEW: number;
}

export const STEPS: Steps = {
  FILE_SELECTION: 1,
  METADATA_SETTINGS: 2,
  RESULTS_VIEW: 3,
};
