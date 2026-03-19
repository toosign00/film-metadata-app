import { Controller } from 'react-hook-form';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';
import type { DateTimeSectionProps } from '@/types/metadataSettings.types';

export const DateTimeSection = ({ control, errors }: DateTimeSectionProps) => {
  return (
    <fieldset
      className='rounded-lg border border-border bg-surface-alt p-4 shadow-md'
      aria-labelledby='date-time-heading'
    >
      <h3
        id='date-time-heading'
        className='mb-3 border-border border-b pb-2 font-medium text-foreground'
      >
        촬영 날짜/시간
      </h3>

      <div className='relative mb-4'>
        <label
          htmlFor='startDate'
          className='mb-1 block font-medium text-foreground-secondary text-sm'
        >
          날짜
        </label>
        <Controller
          control={control}
          name='startDate'
          render={({ field }) => (
            <CustomDatePicker
              selected={field.value}
              onChange={(date: Date | null) => field.onChange(date)}
              dateFormat='yyyy-MM-dd'
              placeholderText='시작 날짜 선택'
              aria-describedby='startDate-help startDate-error'
              aria-required='true'
              aria-invalid={errors.startDate ? 'true' : 'false'}
              id='startDate'
              name='startDate'
            />
          )}
        />
        <div className='flex flex-wrap items-center justify-between'>
          <p id='startDate-help' className='mt-1 text-foreground-muted text-xs'>
            첫 번째 사진의 촬영 날짜 (모든 사진에 동일하게 적용됩니다)
          </p>
          {errors.startDate && (
            <p id='startDate-error' className='mt-1 text-destructive text-xs' role='alert'>
              {String(errors.startDate.message)}
            </p>
          )}
        </div>
      </div>

      <div className='relative'>
        <label
          htmlFor='startTime'
          className='mb-1 block font-medium text-foreground-secondary text-sm'
        >
          시간
        </label>
        <Controller
          control={control}
          name='startTime'
          render={({ field }) => (
            <CustomDatePicker
              selected={field.value}
              onChange={(date: Date | null) => field.onChange(date)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={1}
              timeFormat='HH:mm'
              dateFormat='HH:mm'
              placeholderText='시작 시간 선택'
              aria-describedby='startTime-help startTime-error'
              aria-required='true'
              aria-invalid={errors.startTime ? 'true' : 'false'}
              id='startTime'
              name='startTime'
            />
          )}
        />
        <div className='flex flex-wrap items-center justify-between'>
          <p id='startTime-help' className='mt-1 text-foreground-muted text-xs'>
            첫 번째 사진의 촬영 시간 (사진 순서대로 1초 간격으로 설정됩니다)
          </p>
          {errors.startTime && (
            <p id='startTime-error' className='mt-1 text-destructive text-xs' role='alert'>
              {String(errors.startTime.message)}
            </p>
          )}
        </div>
      </div>
    </fieldset>
  );
};
