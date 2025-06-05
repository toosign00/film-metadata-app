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

export interface WorkerConfig {
  maxWorkers: number;
  chunkSize: number;
  timeout: number;
  retryCount: number;
  retryDelay: number;
}
