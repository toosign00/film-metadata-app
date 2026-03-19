import type { LensSectionProps } from '@/types/metadataSettings.types';

export const LensSection = ({ register, errors }: LensSectionProps) => {
  return (
    <fieldset
      className='rounded-lg border border-border bg-surface-alt p-4 shadow-md'
      aria-labelledby='lens-info-heading'
    >
      <h3
        id='lens-info-heading'
        className='mb-3 border-border border-b pb-2 font-medium text-foreground'
      >
        렌즈 정보
      </h3>

      <div className='relative mb-4'>
        <label htmlFor='lens' className='mb-1 block font-medium text-foreground-secondary text-sm'>
          렌즈
        </label>
        <input
          type='text'
          id='lens'
          {...register('lens')}
          placeholder='예: Canon FD'
          className='w-full rounded-lg border border-border bg-input px-4 py-2.5 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring'
          aria-describedby='lens-help lens-error'
          aria-required='true'
          aria-invalid={!!errors.lens}
        />
        <div className='flex flex-wrap items-center justify-between'>
          <p id='lens-help' className='mt-1 text-foreground-muted text-xs'>
            렌즈 브랜드와 모델명
          </p>
          {errors.lens && (
            <p id='lens-error' className='mt-1 text-destructive text-xs' role='alert'>
              {String(errors.lens.message)}
            </p>
          )}
        </div>
      </div>

      <div className='grid grid-cols-2 gap-3'>
        <div className='relative'>
          <label
            htmlFor='focalLength'
            className='mb-1 block font-medium text-foreground-secondary text-sm'
          >
            초점 거리
          </label>
          <div className='relative'>
            <input
              type='text'
              inputMode='decimal'
              id='focalLength'
              {...register('focalLength')}
              placeholder='예: 50'
              className='w-full rounded-lg border border-border bg-input py-2.5 pr-12 pl-4 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring'
              aria-describedby='focalLength-help focalLength-error'
              aria-required='true'
              aria-invalid={!!errors.focalLength}
            />
            <span className='pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-foreground-muted text-sm'>
              mm
            </span>
          </div>
          <div className='flex flex-wrap items-center justify-between'>
            <p id='focalLength-help' className='mt-1 text-foreground-muted text-xs'>
              숫자만 입력
            </p>
            {errors.focalLength && (
              <p id='focalLength-error' className='mt-1 text-destructive text-xs' role='alert'>
                {String(errors.focalLength.message)}
              </p>
            )}
          </div>
        </div>

        <div className='relative'>
          <label
            htmlFor='aperture'
            className='mb-1 block font-medium text-foreground-secondary text-sm'
          >
            조리개
          </label>
          <div className='relative'>
            <input
              type='text'
              inputMode='decimal'
              id='aperture'
              {...register('aperture')}
              placeholder='예: 1.8'
              className='w-full rounded-lg border border-border bg-input py-2.5 pr-4 pl-9 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring'
              aria-describedby='aperture-help aperture-error'
              aria-required='true'
              aria-invalid={!!errors.aperture}
            />
            <span className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted text-sm'>
              f/
            </span>
          </div>
          <div className='flex flex-wrap items-center justify-between'>
            <p id='aperture-help' className='mt-1 text-foreground-muted text-xs'>
              숫자만 입력
            </p>
            {errors.aperture && (
              <p id='aperture-error' className='mt-1 text-destructive text-xs' role='alert'>
                {String(errors.aperture.message)}
              </p>
            )}
          </div>
        </div>
      </div>
    </fieldset>
  );
};
