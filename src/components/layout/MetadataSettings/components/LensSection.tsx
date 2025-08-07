import type { LensSectionProps } from '@/types/metadata-settings.type';

export const LensSection = ({
  settings,
  validationErrors,
  handleInputChange,
  handleLensInfoChange,
}: LensSectionProps) => {
  return (
    <fieldset
      className='rounded-lg border border-gray-700 bg-gray-900 p-4 shadow-md'
      aria-labelledby='lens-info-heading'
    >
      <h3
        id='lens-info-heading'
        className='mb-3 border-b border-gray-700 pb-2 font-medium text-gray-200'
      >
        렌즈 정보
      </h3>

      <div className='relative mb-4'>
        <label htmlFor='lens' className='mb-1 block text-sm font-medium text-gray-300'>
          렌즈
        </label>
        <input
          type='text'
          id='lens'
          name='lens'
          value={settings.lens}
          onChange={handleInputChange}
          placeholder='예: Canon FD, Nikkor AF 35mm-70mm'
          className='w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none'
          aria-describedby='lens-help lens-error'
          aria-required='true'
          aria-invalid={!!validationErrors.lens}
        />
        <div className='flex flex-wrap items-center justify-between'>
          <p id='lens-help' className='mt-1 text-xs text-gray-500'>
            렌즈 브랜드와 모델명
          </p>
          {validationErrors.lens && (
            <p id='lens-error' className='mt-1 text-xs text-red-500' role='alert'>
              {validationErrors.lens}
            </p>
          )}
        </div>
      </div>

      <div className='relative'>
        <label htmlFor='lensInfo' className='mb-1 block text-sm font-medium text-gray-300'>
          렌즈 정보
        </label>
        <input
          type='text'
          id='lensInfo'
          name='lensInfo'
          value={settings.lensInfo}
          onChange={handleLensInfoChange}
          placeholder='예: 35mm f2.4, 28mm f2.8'
          className='w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none'
          aria-describedby='lensInfo-help lensInfo-error'
          aria-required='true'
          aria-invalid={!!validationErrors.lensInfo}
        />
        <div className='flex flex-wrap items-center justify-between'>
          <p id='lensInfo-help' className='mt-1 text-xs text-gray-500'>
            초점 거리와 조리개 값 (예: 50mm f2.8)
          </p>
          {validationErrors.lensInfo && (
            <p id='lensInfo-error' className='mt-1 text-xs text-red-500' role='alert'>
              {validationErrors.lensInfo}
            </p>
          )}
        </div>
      </div>
    </fieldset>
  );
};
