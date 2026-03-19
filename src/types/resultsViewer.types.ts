import type { MetadataResult } from './metadata.types';

export interface ResultsViewerProps {
  activeStep: number;
  resultRef: React.RefObject<HTMLElement | null>;
  resultImages: MetadataResult[];
  errors: Array<{ file: string; error: string }>;
  processing: boolean;
  zipProgress: number;
  setZipProgress: (progress: number) => void;
  setProcessing: (processing: boolean) => void;
  goToStep: (step: number) => void;
}
