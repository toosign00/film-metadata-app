import { MetadataCard } from '@/components/ui/MetadataCard';
import type { CameraSectionProps } from '@/types/metadataSettings.types';

export const CameraSection = ({ register, errors }: CameraSectionProps) => {
  return (
    <MetadataCard
      id='camera'
      eyebrow='02 / CAMERA'
      title='카메라'
      description='카메라 제조사와 모델을 기록해요.'
    >
      <div className='border-b border-border pb-4'>
        <label
          htmlFor='cameraMake'
          className='mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-foreground-muted'
        >
          제조사
        </label>
        <input
          type='text'
          id='cameraMake'
          {...register('cameraMake')}
          className='min-h-11 w-full rounded-[10px] border border-border bg-input px-3 text-sm text-foreground placeholder:text-foreground-muted/70 transition-colors hover:border-border-hover focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20'
          placeholder='예: Nikon'
          aria-describedby={`cameraMake-help${errors.cameraMake ? ' cameraMake-error' : ''}`}
          aria-invalid={!!errors.cameraMake}
          autoComplete='off'
        />
        <div className='flex flex-wrap items-center justify-between'>
          <p id='cameraMake-help' className='mt-1 text-xs text-foreground-muted'>
            카메라 제조사를 기록해요.
          </p>
          {errors.cameraMake && (
            <p id='cameraMake-error' className='mt-1 text-xs text-destructive' role='alert'>
              {String(errors.cameraMake.message)}
            </p>
          )}
        </div>
      </div>

      <div className='pt-4'>
        <label
          htmlFor='cameraModel'
          className='mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-foreground-muted'
        >
          모델명
        </label>
        <input
          type='text'
          id='cameraModel'
          {...register('cameraModel')}
          className='min-h-11 w-full rounded-[10px] border border-border bg-input px-3 text-sm text-foreground placeholder:text-foreground-muted/70 transition-colors hover:border-border-hover focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20'
          placeholder='예: FM2'
          aria-describedby={`cameraModel-help${errors.cameraModel ? ' cameraModel-error' : ''}`}
          aria-invalid={!!errors.cameraModel}
          autoComplete='off'
        />
        <div className='flex flex-wrap items-center justify-between'>
          <p id='cameraModel-help' className='mt-1 text-xs text-foreground-muted'>
            카메라 모델명을 기록해요.
          </p>
          {errors.cameraModel && (
            <p id='cameraModel-error' className='mt-1 text-xs text-destructive' role='alert'>
              {String(errors.cameraModel.message)}
            </p>
          )}
        </div>
      </div>
    </MetadataCard>
  );
};
