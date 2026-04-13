import { Controller } from 'react-hook-form';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';
import type { DateTimeSectionProps } from '@/types/metadataSettings.types';

export const DateTimeSection = ({ control, errors }: DateTimeSectionProps) => {
  return (
    <fieldset
      className='rounded-xl border border-border bg-surface px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
      aria-labelledby='date-time-heading'
    >
      <h3
        id='date-time-heading'
        className='mb-4 text-sm font-semibold text-foreground'
      >
        촬영 날짜/시간
      </h3>

      <div className='border-b border-border pb-4'>
        <label
          htmlFor='startDate'
          className='mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-foreground-muted'
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
          <p id='startDate-help' className='mt-1 text-xs text-foreground-muted'>
            첫 번째 사진의 촬영 날짜
          </p>
          {errors.startDate && (
            <p id='startDate-error' className='mt-1 text-xs text-destructive' role='alert'>
              {String(errors.startDate.message)}
            </p>
          )}
        </div>
      </div>

      <div className='pt-4'>
        <label
          htmlFor='startTime'
          className='mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-foreground-muted'
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
          <p id='startTime-help' className='mt-1 text-xs text-foreground-muted'>
            사진 순서대로 1초 간격으로 설정됩니다
          </p>
          {errors.startTime && (
            <p id='startTime-error' className='mt-1 text-xs text-destructive' role='alert'>
              {String(errors.startTime.message)}
            </p>
          )}
        </div>
      </div>
    </fieldset>
  );
};
