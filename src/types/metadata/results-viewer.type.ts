import { RefObject } from 'react';
import { MetadataResult } from './metadata.type';

export interface ResultsViewerProps {
  activeStep: number;
  resultRef: RefObject<HTMLElement>;
  resultImages: MetadataResult[];
  processing: boolean;
  zipProgress: number;
  setZipProgress: (progress: number) => void;
  setProcessing: (processing: boolean) => void;
  goToStep: (step: number) => void;
}
