import { type ChangeEvent, type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { MetadataSettingsProps, ValidationErrors } from '@/types/metadata-settings.type';
import { CameraSection } from './components/CameraSection';
import { DateTimeSection } from './components/DateTimeSection';
import { FilmSection } from './components/FilmSection';
import { LensSection } from './components/LensSection';
import { validateForm } from './utils/validation';

export const MetadataSettings = ({
  activeStep,
  settings,
  onSettingsChange,
  sortedFiles,
  processing,
  completed,
  formRef,
  goToStep,
  onProcessFiles,
}: MetadataSettingsProps) => {
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

  const handleChange = (name: string, value: string | Date) => {
    onSettingsChange(name, value);
    if (validationErrors[name]) {
      const newErrors = { ...validationErrors };
      delete newErrors[name];
      setValidationErrors(newErrors);
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      handleChange('startDate', date);
    }
  };

  const handleTimeChange = (date: Date | null) => {
    if (date) {
      handleChange('startTime', date);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    handleChange(name, value);
  };

  const handleLensInfoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    handleChange(name, value);
  };

  return (
    <section className='mb-8 transition-all' aria-labelledby='metadata-section'>
      <div className='rounded-xl border border-gray-700 bg-gray-800 p-5 shadow-md md:p-6'>
        <h2
          id='metadata-section'
          className='mb-4 flex items-center text-xl font-bold text-gray-200'
        >
          <span
            className='mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-sm text-white'
            aria-hidden='true'
          >
            2
          </span>
          메타데이터 설정
        </h2>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className='space-y-6'
          noValidate
          aria-label='메타데이터 설정 폼'
        >
          <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
            <DateTimeSection
              settings={settings}
              validationErrors={validationErrors}
              handleDateChange={handleDateChange}
              handleTimeChange={handleTimeChange}
            />
            <CameraSection
              settings={settings}
              validationErrors={validationErrors}
              handleInputChange={handleInputChange}
            />
            <LensSection
              settings={settings}
              validationErrors={validationErrors}
              handleInputChange={handleInputChange}
              handleLensInfoChange={handleLensInfoChange}
            />
            <FilmSection
              settings={settings}
              validationErrors={validationErrors}
              handleInputChange={handleInputChange}
            />
          </div>

          <div className='mt-6 flex justify-between'>
            <Button
              variant='text'
              type='button'
              onClick={() => goToStep(1)}
              aria-label='이전 단계로 이동'
            >
              &larr; 이전
            </Button>

            <Button
              variant='primary'
              type='submit'
              disabled={processing || sortedFiles.length === 0}
              isLoading={processing && completed > 0}
              aria-busy={processing && completed > 0}
              aria-label='메타데이터 설정 완료'
              icon={
                processing && completed > 0 ? (
                  <span aria-live='polite'>
                    {completed}/{sortedFiles.length}
                  </span>
                ) : null
              }
            >
              메타데이터 설정하기
            </Button>
          </div>

          <div className='sr-only' aria-live='polite'>
            {Object.keys(validationErrors).length > 0
              ? '입력 정보에 오류가 있습니다. 각 필드의 오류 메시지를 확인해주세요.'
              : ''}
          </div>
        </form>
      </div>
    </section>
  );
};
