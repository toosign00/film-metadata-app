import type { MetadataResult } from './metadata.type';

export interface ResultsViewerProps {
  activeStep: number;
  resultRef: React.RefObject<HTMLElement | null>;
  resultImages: MetadataResult[];
  processing: boolean;
  zipProgress: number;
  setZipProgress: (progress: number) => void;
  setProcessing: (processing: boolean) => void;
  goToStep: (step: number) => void;
}
