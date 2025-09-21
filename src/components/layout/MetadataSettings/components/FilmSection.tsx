import type { FilmSectionProps } from '@/types/metadataSettings.types';

export const FilmSection = ({ register, errors }: FilmSectionProps) => {
  return (
    <fieldset
      className='rounded-lg border border-gray-700 bg-gray-900 p-4 shadow-md'
      aria-labelledby='film-info-heading'
    >
      <h3
        id='film-info-heading'
        className='mb-3 border-gray-700 border-b pb-2 font-medium text-gray-200'
      >
        필름 정보
      </h3>

      <div className='relative mb-4'>
        <label htmlFor='filmInfo' className='mb-1 block font-medium text-gray-300 text-sm'>
          필름 정보
        </label>
        <input
          type='text'
          id='filmInfo'
          {...register('filmInfo')}
          placeholder='예: Kodak Portra 400, Fuji Superia 200'
          className='w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          aria-describedby='filmInfo-help filmInfo-error'
          aria-required='true'
          aria-invalid={!!errors.filmInfo}
        />
        <div className='flex flex-wrap items-center justify-between'>
          <p id='filmInfo-help' className='mt-1 text-gray-500 text-xs'>
            필름 브랜드와 종류
          </p>
          {errors.filmInfo && (
            <p id='filmInfo-error' className='mt-1 text-red-500 text-xs' role='alert'>
              {String(errors.filmInfo.message)}
            </p>
          )}
        </div>
      </div>

      <div className='relative'>
        <label htmlFor='isoValue' className='mb-1 block font-medium text-gray-300 text-sm'>
          ISO 값
        </label>
        <input
          type='text'
          id='isoValue'
          {...register('isoValue')}
          placeholder='예: 100, 200, 400, 800'
          className='w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          aria-describedby='isoValue-help isoValue-error'
          aria-required='true'
          aria-invalid={!!errors.isoValue}
        />
        <div className='flex flex-wrap items-center justify-between'>
          <p id='isoValue-help' className='mt-1 text-gray-500 text-xs'>
            필름의 ISO 감도
          </p>
          {errors.isoValue && (
            <p id='isoValue-error' className='mt-1 text-red-500 text-xs' role='alert'>
              {String(errors.isoValue.message)}
            </p>
          )}
        </div>
      </div>
    </fieldset>
  );
};
