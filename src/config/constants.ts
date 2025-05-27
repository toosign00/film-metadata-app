/**
 * 초기 메타데이터 설정값
 */
export interface InitialSettings {
  startDate: Date;
  startTime: number;
  cameraMake: string;
  cameraModel: string;
  filmInfo: string;
  lens: string;
  lensInfo: string;
  isoValue: string;
}

export const INITIAL_SETTINGS: InitialSettings = {
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
