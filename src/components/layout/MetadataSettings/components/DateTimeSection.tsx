import { CustomDatePicker } from '@/components/ui/CustomDatePicker';
import type { DateTimeSectionProps } from '@/types/metadata-settings.type';

export const DateTimeSection = ({
  settings,
  validationErrors,
  handleDateChange,
  handleTimeChange,
}: DateTimeSectionProps) => {
  return (
    <fieldset
      className='rounded-lg border border-gray-700 bg-gray-900 p-4 shadow-md'
      aria-labelledby='date-time-heading'
    >
      <h3
        id='date-time-heading'
        className='mb-3 border-b border-gray-700 pb-2 font-medium text-gray-200'
      >
        촬영 날짜/시간
      </h3>

      <div className='relative mb-4'>
        <label htmlFor='startDate' className='mb-1 block text-sm font-medium text-gray-300'>
          날짜
        </label>
        <CustomDatePicker
          selected={settings.startDate}
          onChange={handleDateChange}
          dateFormat='yyyy-MM-dd'
          placeholderText='시작 날짜 선택'
          aria-describedby='startDate-help startDate-error'
          aria-required='true'
          aria-invalid={!!validationErrors.startDate}
          id='startDate'
          name='startDate'
        />
        <div className='flex flex-wrap items-center justify-between'>
          <p id='startDate-help' className='mt-1 text-xs text-gray-500'>
            첫 번째 사진의 촬영 날짜 (모든 사진에 동일하게 적용됩니다)
          </p>
          {validationErrors.startDate && (
            <p id='startDate-error' className='mt-1 text-xs text-red-500' role='alert'>
              {validationErrors.startDate}
            </p>
          )}
        </div>
      </div>

      <div className='relative'>
        <label htmlFor='startTime' className='mb-1 block text-sm font-medium text-gray-300'>
          시간
        </label>
        <CustomDatePicker
          selected={new Date(settings.startTime)}
          onChange={handleTimeChange}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={1}
          timeFormat='HH:mm'
          dateFormat='HH:mm'
          placeholderText='시작 시간 선택'
          aria-describedby='startTime-help startTime-error'
          aria-required='true'
          aria-invalid={!!validationErrors.startTime}
          id='startTime'
          name='startTime'
        />
        <div className='flex flex-wrap items-center justify-between'>
          <p id='startTime-help' className='mt-1 text-xs text-gray-500'>
            첫 번째 사진의 촬영 시간 (사진 순서대로 1초 간격으로 설정됩니다)
          </p>
          {validationErrors.startTime && (
            <p id='startTime-error' className='mt-1 text-xs text-red-500' role='alert'>
              {validationErrors.startTime}
            </p>
          )}
        </div>
      </div>
    </fieldset>
  );
};
