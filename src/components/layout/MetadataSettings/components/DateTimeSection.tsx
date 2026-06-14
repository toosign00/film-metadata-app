import { Controller } from 'react-hook-form';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';
import { MetadataCard } from '@/components/ui/MetadataCard';
import type { DateTimeSectionProps } from '@/types/metadataSettings.types';

export const DateTimeSection = ({ control, errors }: DateTimeSectionProps) => {
  return (
    <MetadataCard
      id='capture'
      eyebrow='01 / CAPTURE'
      title='날짜 및 시간'
      description='첫 사진의 촬영 시점을 기준으로 기록해요.'
    >
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
              aria-describedby={`startDate-help${errors.startDate ? ' startDate-error' : ''}`}
              aria-required='true'
              aria-invalid={errors.startDate ? 'true' : 'false'}
              id='startDate'
              name='startDate'
            />
          )}
        />
        <div className='flex flex-wrap items-center justify-between'>
          <p id='startDate-help' className='mt-1 text-xs text-foreground-muted'>
            첫 사진의 촬영 날짜를 기록해요.
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
              aria-describedby={`startTime-help${errors.startTime ? ' startTime-error' : ''}`}
              aria-required='true'
              aria-invalid={errors.startTime ? 'true' : 'false'}
              id='startTime'
              name='startTime'
            />
          )}
        />
        <div className='flex flex-wrap items-center justify-between'>
          <p id='startTime-help' className='mt-1 text-xs text-foreground-muted'>
            사진 순서대로 1초 간격을 적용해요.
          </p>
          {errors.startTime && (
            <p id='startTime-error' className='mt-1 text-xs text-destructive' role='alert'>
              {String(errors.startTime.message)}
            </p>
          )}
        </div>
      </div>
    </MetadataCard>
  );
};
