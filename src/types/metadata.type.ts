export interface MetadataSettings {
  cameraMake: string;
  cameraModel: string;
  filmInfo: string;
  lens: string;
  lensInfo: string;
  isoValue: string;
  startDate: Date;
  startTime: Date;
}

export interface MetadataResult {
  file: File;
  url: string;
  name: string;
  dateTime: string;
}

export interface ProcessMetadataResults {
  images: MetadataResult[];
  errors: Array<{
    file: string;
    error: string;
  }>;
}

export type ProgressCallback = (progress: number) => void;
