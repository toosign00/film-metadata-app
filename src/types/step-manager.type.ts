import type { MetadataResult } from './metadata.type';

export interface StepManagerProps {
  onComplete?: (results: MetadataResult[]) => void;
}
