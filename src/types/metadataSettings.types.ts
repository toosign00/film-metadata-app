import type { RefObject } from 'react';
import type { Control, FieldErrors, UseFormRegister } from 'react-hook-form';
import type { MetadataSettings as MetadataSettingsType } from './metadata.types';

// RHF 오류 타입 별칭 (가독성용)
export type MetadataFieldErrors = FieldErrors<MetadataSettingsType>;

export interface MetadataSettingsProps {
  activeStep: number;
  settings: MetadataSettingsType;
  onSettingsChange: (name: string, value: string | Date) => void;
  sortedFiles: File[];
  processing: boolean;
  completed: number;
  formRef: RefObject<HTMLFormElement | null>;
  goToStep: (step: number) => void;
  onProcessFiles: () => void;
}

export interface DateTimeSectionProps {
  control: Control<MetadataSettingsType>;
  errors: MetadataFieldErrors;
}

export interface CameraSectionProps {
  register: UseFormRegister<MetadataSettingsType>;
  errors: MetadataFieldErrors;
}

export interface LensSectionProps {
  register: UseFormRegister<MetadataSettingsType>;
  errors: MetadataFieldErrors;
}

export interface FilmSectionProps {
  register: UseFormRegister<MetadataSettingsType>;
  errors: MetadataFieldErrors;
}
