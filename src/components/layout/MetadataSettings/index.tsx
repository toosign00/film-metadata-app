import React, { useState, FormEvent, ChangeEvent } from 'react';
import Button from '../../ui/Button';
import DateTimeSection from './components/DateTimeSection';
import CameraSection from './components/CameraSection';
import LensSection from './components/LensSection';
import FilmSection from './components/FilmSection';
import { validateForm } from './utils/validation';
import { MetadataSettings as MetadataSettingsType } from '../../../config/constants';

interface ValidationErrors {
  startDate?: string;
  startTime?: string;
  cameraMake?: string;
  cameraModel?: string;
  lens?: string;
  lensInfo?: string;
  filmInfo?: string;
  isoValue?: string;
}

interface MetadataSettingsProps {
  activeStep: number;
  settings: MetadataSettingsType;
  onSettingsChange: (name: keyof MetadataSettingsType, value: MetadataSettingsType[keyof MetadataSettingsType]) => void;
  sortedFiles: File[];
  processing: boolean;
  completed: number;
  formRef: React.RefObject<HTMLFormElement | null>;
  goToStep: (step: number) => void;
  onProcessFiles: (e: FormEvent) => void;
}

const MetadataSettings: React.FC<MetadataSettingsProps> = ({
  activeStep,
  settings,
  onSettingsChange,
  sortedFiles,
  processing,
  completed,
  formRef,
  goToStep,
  onProcessFiles,
}) => {
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  if (activeStep !== 2) {
    return null;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errors = validateForm(settings);
    setValidationErrors(errors);

    if (Object.keys(errors).length === 0) {
      onProcessFiles(e);
    }
  };

  const handleChange = (name: keyof MetadataSettingsType, value: MetadataSettingsType[keyof MetadataSettingsType]) => {
    onSettingsChange(name, value);
    if (validationErrors[name]) {
      const newErrors = { ...validationErrors };
      delete newErrors[name];
      setValidationErrors(newErrors);
    }
  };

  const handleDateChange = (date: Date | null) => {
    handleChange('startDate', date || new Date());
  };

  const handleTimeChange = (date: Date | null) => {
    if (date) {
      handleChange('startTime', date.getTime());
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    handleChange(name as keyof MetadataSettingsType, value);
  };

  const handleLensInfoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    handleChange(name as keyof MetadataSettingsType, value);
  };

  return (
    <section className="mb-8 transition-all" aria-labelledby="metadata-section">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 md:p-6 shadow-md">
        <h2 id="metadata-section" className="text-xl font-bold text-gray-200 mb-4 flex items-center">
          <span className="flex items-center justify-center bg-blue-600 text-white rounded-full w-6 h-6 text-sm mr-2" aria-hidden="true">
            2
          </span>
          메타데이터 설정
        </h2>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" noValidate aria-label="메타데이터 설정 폼">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <DateTimeSection
              settings={settings}
              validationErrors={validationErrors}
              handleDateChange={handleDateChange}
              handleTimeChange={handleTimeChange}
            />
            <CameraSection settings={settings} validationErrors={validationErrors} handleInputChange={handleInputChange} />
            <LensSection
              settings={settings}
              validationErrors={validationErrors}
              handleInputChange={handleInputChange}
              handleLensInfoChange={handleLensInfoChange}
            />
            <FilmSection settings={settings} validationErrors={validationErrors} handleInputChange={handleInputChange} />
          </div>

          <div className="mt-6 flex justify-between">
            <Button variant="text" type="button" onClick={() => goToStep(1)} aria-label="이전 단계로 이동">
              &larr; 이전
            </Button>

            <Button
              variant="primary"
              type="submit"
              disabled={processing || sortedFiles.length === 0}
              isLoading={processing && completed > 0}
              aria-busy={processing && completed > 0}
              aria-label="메타데이터 설정 완료"
              icon={
                processing && completed > 0 ? (
                  <>
                    <span aria-live="polite">
                      {completed}/{sortedFiles.length}
                    </span>
                  </>
                ) : null
              }
            >
              메타데이터 설정하기
            </Button>
          </div>

          <div className="sr-only" aria-live="polite">
            {Object.keys(validationErrors).length > 0 ? '입력 정보에 오류가 있습니다. 각 필드의 오류 메시지를 확인해주세요.' : ''}
          </div>
        </form>
      </div>
    </section>
  );
};

export default MetadataSettings;
