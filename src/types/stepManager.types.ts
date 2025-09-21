import type { MetadataResult } from './metadata.types';

export interface StepManagerProps {
  onComplete?: (results: MetadataResult[]) => void;
}
