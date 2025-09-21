import type { LensSectionProps } from '@/types/metadata-settings.type';

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
          placeholder='예: Canon FD, Nikkor AF 35mm-70mm'
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

      <div className='relative'>
        <label htmlFor='lensInfo' className='mb-1 block font-medium text-gray-300 text-sm'>
          렌즈 정보
        </label>
        <input
          type='text'
          id='lensInfo'
          {...register('lensInfo')}
          placeholder='예: 35mm f2.4, 28mm f2.8'
          className='w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          aria-describedby='lensInfo-help lensInfo-error'
          aria-required='true'
          aria-invalid={!!errors.lensInfo}
        />
        <div className='flex flex-wrap items-center justify-between'>
          <p id='lensInfo-help' className='mt-1 text-gray-500 text-xs'>
            초점 거리와 조리개 값 (예: 50mm f2.8)
          </p>
          {errors.lensInfo && (
            <p id='lensInfo-error' className='mt-1 text-red-500 text-xs' role='alert'>
              {String(errors.lensInfo.message)}
            </p>
          )}
        </div>
      </div>
    </fieldset>
  );
};
