import { MetadataCard } from '@/components/ui/MetadataCard';
import type { FilmSectionProps } from '@/types/metadataSettings.types';

export const FilmSection = ({ register, errors }: FilmSectionProps) => {
  return (
    <MetadataCard
      id='film'
      eyebrow='04 / FILM'
      title='필름'
      description='필름 종류와 감도를 입력해요.'
    >
      <div className='border-b border-border pb-4'>
        <label
          htmlFor='filmInfo'
          className='mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-foreground-muted'
        >
          필름
        </label>
        <input
          type='text'
          id='filmInfo'
          {...register('filmInfo')}
          placeholder='예: Kodak Portra 400'
          className='min-h-11 w-full rounded-[10px] border border-border bg-input px-3 text-sm text-foreground placeholder:text-foreground-muted/70 transition-colors hover:border-border-hover focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20'
          aria-describedby='filmInfo-help filmInfo-error'
          aria-invalid={!!errors.filmInfo}
        />
        <div className='flex flex-wrap items-center justify-between'>
          <p id='filmInfo-help' className='mt-1 text-xs text-foreground-muted'>
            필름 종류와 제품명을 기록해요.
          </p>
          {errors.filmInfo && (
            <p id='filmInfo-error' className='mt-1 text-xs text-destructive' role='alert'>
              {String(errors.filmInfo.message)}
            </p>
          )}
        </div>
      </div>

      <div className='pt-4'>
        <label
          htmlFor='isoValue'
          className='mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-foreground-muted'
        >
          ISO
        </label>
        <input
          type='text'
          id='isoValue'
          {...register('isoValue')}
          placeholder='예: 400'
          className='min-h-11 w-full rounded-[10px] border border-border bg-input px-3 text-sm text-foreground placeholder:text-foreground-muted/70 transition-colors hover:border-border-hover focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20'
          aria-describedby='isoValue-help isoValue-error'
          aria-invalid={!!errors.isoValue}
        />
        <div className='flex flex-wrap items-center justify-between'>
          <p id='isoValue-help' className='mt-1 text-xs text-foreground-muted'>
            ISO 감도 값을 기록해요.
          </p>
          {errors.isoValue && (
            <p id='isoValue-error' className='mt-1 text-xs text-destructive' role='alert'>
              {String(errors.isoValue.message)}
            </p>
          )}
        </div>
      </div>
    </MetadataCard>
  );
};
