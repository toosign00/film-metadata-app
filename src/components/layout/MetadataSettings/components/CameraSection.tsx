import type { CameraSectionProps } from '@/types/metadata-settings.type';

export const CameraSection = ({
  settings,
  validationErrors,
  handleInputChange,
}: CameraSectionProps) => {
  return (
    <fieldset
      className='rounded-lg border border-gray-700 bg-gray-900 p-4 shadow-md'
      aria-labelledby='camera-heading'
    >
      <h3
        id='camera-heading'
        className='mb-3 border-gray-700 border-b pb-2 font-medium text-gray-200'
      >
        카메라 정보
      </h3>

      <div className='relative mb-4'>
        <label htmlFor='cameraMake' className='mb-1 block font-medium text-gray-300 text-sm'>
          제조사
        </label>
        <input
          type='text'
          id='cameraMake'
          name='cameraMake'
          value={settings.cameraMake}
          onChange={handleInputChange}
          className='w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-gray-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500'
          placeholder='예: Nikon'
          aria-describedby='cameraMake-help cameraMake-error'
          aria-invalid={!!validationErrors.cameraMake}
          autoComplete='off'
          required
        />
        <div className='flex flex-wrap items-center justify-between'>
          <p id='cameraMake-help' className='mt-1 text-gray-500 text-xs'>
            카메라 제조사를 입력하세요
          </p>
          {validationErrors.cameraMake && (
            <p id='cameraMake-error' className='mt-1 text-red-500 text-xs' role='alert'>
              {validationErrors.cameraMake}
            </p>
          )}
        </div>
      </div>

      <div className='relative'>
        <label htmlFor='cameraModel' className='mb-1 block font-medium text-gray-300 text-sm'>
          모델명
        </label>
        <input
          type='text'
          id='cameraModel'
          name='cameraModel'
          value={settings.cameraModel}
          onChange={handleInputChange}
          className='w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-gray-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500'
          placeholder='예: FM2'
          aria-describedby='cameraModel-help cameraModel-error'
          aria-invalid={!!validationErrors.cameraModel}
          autoComplete='off'
          required
        />
        <div className='flex flex-wrap items-center justify-between'>
          <p id='cameraModel-help' className='mt-1 text-gray-500 text-xs'>
            카메라 모델명을 입력하세요
          </p>
          {validationErrors.cameraModel && (
            <p id='cameraModel-error' className='mt-1 text-red-500 text-xs' role='alert'>
              {validationErrors.cameraModel}
            </p>
          )}
        </div>
      </div>
    </fieldset>
  );
};
