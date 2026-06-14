'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { StepIntro } from '@/components/layout/StepIntro';
import { Button } from '@/components/ui/Button';
import type { MetadataSettings } from '@/types/metadata.types';
import type { MetadataSettingsProps } from '@/types/metadataSettings.types';
import type { PresetData } from '@/types/preset.types';
import { metadataSettingsSchema } from '@/utils/metadataSchema';
import { CameraSection } from './components/CameraSection';
import { DateTimeSection } from './components/DateTimeSection';
import { FilmSection } from './components/FilmSection';
import { LensSection } from './components/LensSection';
import { PresetBar } from './components/PresetBar';

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
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    getValues,
  } = useForm<MetadataSettings>({
    resolver: zodResolver(metadataSettingsSchema),
    defaultValues: settings,
    mode: 'onBlur',
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handlePresetLoad = useCallback(
    (data: PresetData) => {
      const current = getValues();
      reset({ ...current, ...data });
      for (const [key, value] of Object.entries(data)) {
        onSettingsChange(key as keyof MetadataSettings, value);
      }
    },
    [reset, getValues, onSettingsChange]
  );

  const getCurrentPresetData = useCallback((): PresetData => {
    const v = getValues();
    return {
      cameraMake: v.cameraMake,
      cameraModel: v.cameraModel,
      filmInfo: v.filmInfo,
      lens: v.lens,
      focalLength: v.focalLength,
      aperture: v.aperture,
      isoValue: v.isoValue,
    };
  }, [getValues]);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (!name) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const fieldName = name as keyof MetadataSettings;
        onSettingsChange(fieldName, value[fieldName] as string | Date);
      }, 300);
    });
    return () => {
      subscription.unsubscribe();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [watch, onSettingsChange]);

  if (activeStep !== 2) {
    return null;
  }

  return (
    <section aria-labelledby='metadata-section'>
      <StepIntro
        eyebrow='02 / METADATA'
        title='촬영 정보를 입력하세요'
        titleId='metadata-section'
        description={<p>선택한 모든 이미지에 같은 EXIF 정보를 적용해요.</p>}
      />
      <form
        ref={formRef}
        onSubmit={handleSubmit(() => onProcessFiles())}
        noValidate
        aria-label='메타데이터 설정 폼'
      >
        <PresetBar onLoad={handlePresetLoad} getCurrentData={getCurrentPresetData} />

        <div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-2'>
          <DateTimeSection control={control} errors={errors} />
          <CameraSection register={register} errors={errors} />
          <LensSection register={register} errors={errors} />
          <FilmSection register={register} errors={errors} />
        </div>

        <div className='mt-8 flex flex-wrap items-center justify-between gap-4'>
          <Button
            variant='text'
            type='button'
            onClick={() => goToStep(1)}
            aria-label='이미지 선택 단계로 이동'
          >
            ← 이미지 선택
          </Button>

          <Button
            variant='primary'
            type='submit'
            disabled={processing || sortedFiles.length === 0}
            isLoading={processing}
            aria-busy={processing}
            aria-label={
              processing
                ? `메타데이터 적용 중 ${completed}/${sortedFiles.length}`
                : '메타데이터 적용하기'
            }
          >
            {processing ? (
              <span aria-hidden='true'>
                {completed}/{sortedFiles.length} 처리 중
              </span>
            ) : (
              '메타데이터 적용하기 →'
            )}
          </Button>
        </div>

        <div className='sr-only' aria-live='polite'>
          {processing
            ? `메타데이터 적용 중 ${completed}/${sortedFiles.length}`
            : Object.keys(errors).length > 0
              ? '입력 정보에 오류가 있습니다. 각 필드의 오류 메시지를 확인해주세요.'
              : ''}
        </div>
      </form>
    </section>
  );
};
