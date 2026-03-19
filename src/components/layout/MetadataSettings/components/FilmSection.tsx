import type { FilmSectionProps } from '@/types/metadataSettings.types';

export const FilmSection = ({ register, errors }: FilmSectionProps) => {
  return (
    <fieldset
      className='rounded-lg border border-border bg-surface-alt p-4 shadow-md'
      aria-labelledby='film-heading'
    >
      <h3
        id='film-heading'
        className='mb-3 border-border border-b pb-2 font-medium text-foreground'
      >
        필름 정보
      </h3>

      <div className='relative mb-4'>
        <label
          htmlFor='filmInfo'
          className='mb-1 block font-medium text-foreground-secondary text-sm'
        >
          필름
        </label>
        <input
          type='text'
          id='filmInfo'
          {...register('filmInfo')}
          placeholder='예: Kodak Portra 400'
          className='w-full rounded-lg border border-border bg-input px-4 py-2.5 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring'
          aria-describedby='filmInfo-help filmInfo-error'
          aria-required='true'
          aria-invalid={!!errors.filmInfo}
        />
        <div className='flex flex-wrap items-center justify-between'>
          <p id='filmInfo-help' className='mt-1 text-foreground-muted text-xs'>
            필름 종류 (예: Kodak Portra 400)
          </p>
          {errors.filmInfo && (
            <p id='filmInfo-error' className='mt-1 text-destructive text-xs' role='alert'>
              {String(errors.filmInfo.message)}
            </p>
          )}
        </div>
      </div>

      <div className='relative'>
        <label
          htmlFor='isoValue'
          className='mb-1 block font-medium text-foreground-secondary text-sm'
        >
          ISO
        </label>
        <input
          type='text'
          id='isoValue'
          {...register('isoValue')}
          placeholder='예: 400'
          className='w-full rounded-lg border border-border bg-input px-4 py-2.5 text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring'
          aria-describedby='isoValue-help isoValue-error'
          aria-required='true'
          aria-invalid={!!errors.isoValue}
        />
        <div className='flex flex-wrap items-center justify-between'>
          <p id='isoValue-help' className='mt-1 text-foreground-muted text-xs'>
            ISO 감도 값
          </p>
          {errors.isoValue && (
            <p id='isoValue-error' className='mt-1 text-destructive text-xs' role='alert'>
              {String(errors.isoValue.message)}
            </p>
          )}
        </div>
      </div>
    </fieldset>
  );
};
