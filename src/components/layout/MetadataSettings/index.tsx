'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import type { MetadataSettings } from '@/types/metadata.types';
import type { MetadataSettingsProps } from '@/types/metadataSettings.types';
import { metadataSettingsSchema } from '@/utils/metadataSchema';
import { CameraSection } from './components/CameraSection';
import { DateTimeSection } from './components/DateTimeSection';
import { FilmSection } from './components/FilmSection';
import { LensSection } from './components/LensSection';

export const MetadataSettingsForm = ({
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
  const defaultValues = useMemo<MetadataSettings>(() => settings, [settings]);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<MetadataSettings>({
    resolver: zodResolver(metadataSettingsSchema),
    defaultValues,
    mode: 'onBlur',
  });

  // store 동기화: 폼 값 변화 시 store에 반영 (현재 onSettingsChange API 유지)
  watch((value, { name }) => {
    if (!name) return;
    const fieldName = name as keyof MetadataSettings;
    onSettingsChange(fieldName, value[fieldName] as string | Date);
  });

  if (activeStep !== 2) {
    return null;
  }

  return (
    <section className='mb-8 transition-all' aria-labelledby='metadata-section'>
      <div className='rounded-xl border border-gray-700 bg-gray-800 p-5 shadow-md md:p-6'>
        <h2
          id='metadata-section'
          className='mb-4 flex items-center font-bold text-gray-200 text-xl'
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
          onSubmit={handleSubmit(() => onProcessFiles())}
          className='space-y-6'
          noValidate
          aria-label='메타데이터 설정 폼'
        >
          <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
            <DateTimeSection control={control} errors={errors} />
            <CameraSection register={register} errors={errors} />
            <LensSection register={register} errors={errors} />
            <FilmSection register={register} errors={errors} />
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
            {Object.keys(errors).length > 0
              ? '입력 정보에 오류가 있습니다. 각 필드의 오류 메시지를 확인해주세요.'
              : ''}
          </div>
        </form>
      </div>
    </section>
  );
};
