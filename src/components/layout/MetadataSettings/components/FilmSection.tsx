import type { FilmSectionProps } from '@/types/metadataSettings.types';

export const FilmSection = ({ register, errors }: FilmSectionProps) => {
  return (
    <fieldset
      className='rounded-xl border border-border bg-surface px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
      aria-labelledby='film-heading'
    >
      <h3
        id='film-heading'
        className='mb-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-foreground-muted'
      >
        필름 정보
      </h3>

      <div className='border-b border-border pb-4'>
        <label
          htmlFor='filmInfo'
          className='mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-foreground-muted'
        >
          필름
        </label>
        <input
          type='text'
          id='filmInfo'
          {...register('filmInfo')}
          placeholder='예: Kodak Portra 400'
          className='w-full bg-transparent py-1.5 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none'
          aria-describedby='filmInfo-help filmInfo-error'
          aria-invalid={!!errors.filmInfo}
        />
        <div className='flex flex-wrap items-center justify-between'>
          <p id='filmInfo-help' className='mt-1 text-xs text-foreground-muted'>
            필름 종류 (예: Kodak Portra 400)
          </p>
          {errors.filmInfo && (
            <p id='filmInfo-error' className='mt-1 text-xs text-destructive' role='alert'>
              {String(errors.filmInfo.message)}
            </p>
          )}
        </div>
      </div>

      <div className='pt-4'>
        <label
          htmlFor='isoValue'
          className='mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-foreground-muted'
        >
          ISO
        </label>
        <input
          type='text'
          id='isoValue'
          {...register('isoValue')}
          placeholder='예: 400'
          className='w-full bg-transparent py-1.5 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none'
          aria-describedby='isoValue-help isoValue-error'
          aria-invalid={!!errors.isoValue}
        />
        <div className='flex flex-wrap items-center justify-between'>
          <p id='isoValue-help' className='mt-1 text-xs text-foreground-muted'>
            ISO 감도 값
          </p>
          {errors.isoValue && (
            <p id='isoValue-error' className='mt-1 text-xs text-destructive' role='alert'>
              {String(errors.isoValue.message)}
            </p>
          )}
        </div>
      </div>
    </fieldset>
  );
};
