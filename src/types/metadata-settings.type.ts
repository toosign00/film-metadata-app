import type { ChangeEvent, FormEvent, RefObject } from 'react';
import type { MetadataSettings as MetadataSettingsType } from './metadata.type';

export interface ValidationErrors {
  [key: string]: string;
}

export interface MetadataSettingsProps {
  activeStep: number;
  settings: MetadataSettingsType;
  onSettingsChange: (name: string, value: string | Date) => void;
  sortedFiles: File[];
  processing: boolean;
  completed: number;
  formRef: RefObject<HTMLFormElement | null>;
  goToStep: (step: number) => void;
  onProcessFiles: (e: FormEvent) => void;
}

export interface DateTimeSectionProps {
  settings: MetadataSettingsType;
  validationErrors: ValidationErrors;
  handleDateChange: (date: Date | null) => void;
  handleTimeChange: (date: Date | null) => void;
}

export interface CameraSectionProps {
  settings: MetadataSettingsType;
  validationErrors: ValidationErrors;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export interface LensSectionProps {
  settings: MetadataSettingsType;
  validationErrors: ValidationErrors;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleLensInfoChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export interface FilmSectionProps {
  settings: MetadataSettingsType;
  validationErrors: ValidationErrors;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
}
