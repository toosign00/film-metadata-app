import type { CameraSectionProps } from '@/types/metadataSettings.types';

export const CameraSection = ({ register, errors }: CameraSectionProps) => {
  return (
    <fieldset
      className='rounded-xl border border-border bg-surface px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
      aria-labelledby='camera-heading'
    >
      <h3 id='camera-heading' className='mb-4 text-sm font-semibold text-foreground'>
        카메라 정보
      </h3>

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
          className='w-full rounded-md border border-border bg-surface-alt px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted transition-colors focus:border-primary focus:outline-none'
          placeholder='예: Nikon'
          aria-describedby='cameraMake-help cameraMake-error'
          aria-invalid={!!errors.cameraMake}
          autoComplete='off'
        />
        <div className='flex flex-wrap items-center justify-between'>
          <p id='cameraMake-help' className='mt-1 text-xs text-foreground-muted'>
            카메라 제조사를 입력하세요
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
          className='w-full rounded-md border border-border bg-surface-alt px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted transition-colors focus:border-primary focus:outline-none'
          placeholder='예: FM2'
          aria-describedby='cameraModel-help cameraModel-error'
          aria-invalid={!!errors.cameraModel}
          autoComplete='off'
        />
        <div className='flex flex-wrap items-center justify-between'>
          <p id='cameraModel-help' className='mt-1 text-xs text-foreground-muted'>
            카메라 모델명을 입력하세요
          </p>
          {errors.cameraModel && (
            <p id='cameraModel-error' className='mt-1 text-xs text-destructive' role='alert'>
              {String(errors.cameraModel.message)}
            </p>
          )}
        </div>
      </div>
    </fieldset>
  );
};
