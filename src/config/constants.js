/**
 * 초기 메타데이터 설정값
 */
export const INITIAL_SETTINGS = {
  startDate: new Date(),
  startTime: new Date().setHours(8, 0, 0, 0),
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
export const STEPS = {
  FILE_SELECTION: 1,
  METADATA_SETTINGS: 2,
  RESULTS_VIEW: 3,
};
