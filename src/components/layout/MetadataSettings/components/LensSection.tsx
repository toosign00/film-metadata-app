import type { LensSectionProps } from '@/types/metadataSettings.types';

export const LensSection = ({ register, errors }: LensSectionProps) => {
  return (
    <fieldset
      className='rounded-lg border border-gray-700 bg-gray-900 p-4 shadow-md'
      aria-labelledby='lens-info-heading'
    >
      <h3
        id='lens-info-heading'
        className='mb-3 border-gray-700 border-b pb-2 font-medium text-gray-200'
      >
        렌즈 정보
      </h3>

      <div className='relative mb-4'>
        <label htmlFor='lens' className='mb-1 block font-medium text-gray-300 text-sm'>
          렌즈
        </label>
        <input
          type='text'
          id='lens'
          {...register('lens')}
          placeholder='예: Canon FD'
          className='w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          aria-describedby='lens-help lens-error'
          aria-required='true'
          aria-invalid={!!errors.lens}
        />
        <div className='flex flex-wrap items-center justify-between'>
          <p id='lens-help' className='mt-1 text-gray-500 text-xs'>
            렌즈 브랜드와 모델명
          </p>
          {errors.lens && (
            <p id='lens-error' className='mt-1 text-red-500 text-xs' role='alert'>
              {String(errors.lens.message)}
            </p>
          )}
        </div>
      </div>

      <div className='grid grid-cols-2 gap-3'>
        <div className='relative'>
          <label htmlFor='focalLength' className='mb-1 block font-medium text-gray-300 text-sm'>
            초점 거리
          </label>
          <div className='relative'>
            <input
              type='text'
              inputMode='decimal'
              id='focalLength'
              {...register('focalLength')}
              placeholder='예: 50'
              className='w-full rounded-lg border border-gray-700 bg-gray-800 py-2.5 pr-12 pl-4 text-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              aria-describedby='focalLength-help focalLength-error'
              aria-required='true'
              aria-invalid={!!errors.focalLength}
            />
            <span className='pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-gray-500 text-sm'>
              mm
            </span>
          </div>
          <div className='flex flex-wrap items-center justify-between'>
            <p id='focalLength-help' className='mt-1 text-gray-500 text-xs'>
              숫자만 입력
            </p>
            {errors.focalLength && (
              <p id='focalLength-error' className='mt-1 text-red-500 text-xs' role='alert'>
                {String(errors.focalLength.message)}
              </p>
            )}
          </div>
        </div>

        <div className='relative'>
          <label htmlFor='aperture' className='mb-1 block font-medium text-gray-300 text-sm'>
            조리개
          </label>
          <div className='relative'>
            <input
              type='text'
              inputMode='decimal'
              id='aperture'
              {...register('aperture')}
              placeholder='예: 1.8'
              className='w-full rounded-lg border border-gray-700 bg-gray-800 py-2.5 pr-4 pl-9 text-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
              aria-describedby='aperture-help aperture-error'
              aria-required='true'
              aria-invalid={!!errors.aperture}
            />
            <span className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm'>
              f
            </span>
          </div>
          <div className='flex flex-wrap items-center justify-between'>
            <p id='aperture-help' className='mt-1 text-gray-500 text-xs'>
              숫자만 입력
            </p>
            {errors.aperture && (
              <p id='aperture-error' className='mt-1 text-red-500 text-xs' role='alert'>
                {String(errors.aperture.message)}
              </p>
            )}
          </div>
        </div>
      </div>
    </fieldset>
  );
};
