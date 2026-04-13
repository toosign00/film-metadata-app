import type { LensSectionProps } from '@/types/metadataSettings.types';

export const LensSection = ({ register, errors }: LensSectionProps) => {
  return (
    <fieldset
      className='rounded-xl border border-border bg-surface px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
      aria-labelledby='lens-info-heading'
    >
      <h3
        id='lens-info-heading'
        className='mb-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-foreground-muted'
      >
        렌즈 정보
      </h3>

      <div className='border-b border-border pb-4'>
        <label
          htmlFor='lens'
          className='mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-foreground-muted'
        >
          렌즈
        </label>
        <input
          type='text'
          id='lens'
          {...register('lens')}
          placeholder='예: Canon FD'
          className='w-full bg-transparent py-1.5 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none'
          aria-describedby='lens-help lens-error'
          aria-invalid={!!errors.lens}
        />
        <div className='flex flex-wrap items-center justify-between'>
          <p id='lens-help' className='mt-1 text-xs text-foreground-muted'>
            렌즈 브랜드와 모델명
          </p>
          {errors.lens && (
            <p id='lens-error' className='mt-1 text-xs text-destructive' role='alert'>
              {String(errors.lens.message)}
            </p>
          )}
        </div>
      </div>

      <div className='grid grid-cols-2 gap-x-4 pt-4'>
        <div>
          <label
            htmlFor='focalLength'
            className='mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-foreground-muted'
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
              className='w-full bg-transparent py-1.5 pr-8 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none'
              aria-describedby='focalLength-help focalLength-error'
              aria-invalid={!!errors.focalLength}
            />
            <span className='pointer-events-none absolute top-1/2 right-1 -translate-y-1/2 text-xs text-foreground-muted'>
              mm
            </span>
          </div>
          {errors.focalLength && (
            <p id='focalLength-error' className='mt-1 text-xs text-destructive' role='alert'>
              {String(errors.focalLength.message)}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor='aperture'
            className='mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-foreground-muted'
          >
            조리개
          </label>
          <div className='relative'>
            <span className='pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 text-xs text-foreground-muted'>
              f/
            </span>
            <input
              type='text'
              inputMode='decimal'
              id='aperture'
              {...register('aperture')}
              placeholder='예: 1.8'
              className='w-full bg-transparent py-1.5 pl-5 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none'
              aria-describedby='aperture-help aperture-error'
              aria-invalid={!!errors.aperture}
            />
          </div>
          {errors.aperture && (
            <p id='aperture-error' className='mt-1 text-xs text-destructive' role='alert'>
              {String(errors.aperture.message)}
            </p>
          )}
        </div>
      </div>
    </fieldset>
  );
};
