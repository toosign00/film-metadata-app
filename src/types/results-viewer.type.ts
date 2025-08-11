import type { Image } from './imageCard.type';

export interface ResultsViewerProps {
  activeStep: number;
  resultRef: React.RefObject<HTMLElement | null>;
  resultImages: Image[];
  processing: boolean;
  zipProgress: number;
  setZipProgress: (progress: number) => void;
  setProcessing: (processing: boolean) => void;
  goToStep: (step: number) => void;
}
