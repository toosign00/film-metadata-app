import { MetadataCard } from '@/components/ui/MetadataCard';
import type { LensSectionProps } from '@/types/metadataSettings.types';

export const LensSection = ({ register, errors }: LensSectionProps) => {
  return (
    <MetadataCard
      id='lens'
      eyebrow='03 / LENS'
      title='렌즈'
      description='렌즈와 촬영 설정을 입력해요.'
    >
      <div className='border-b border-border pb-4'>
        <label
          htmlFor='lens'
          className='mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-foreground-muted'
        >
          렌즈
        </label>
        <input
          type='text'
          id='lens'
          {...register('lens')}
          placeholder='예: Canon FD'
          className='min-h-11 w-full rounded-[10px] border border-border bg-input px-3 text-sm text-foreground placeholder:text-foreground-muted/70 transition-colors hover:border-border-hover focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20'
          aria-describedby={`lens-help${errors.lens ? ' lens-error' : ''}`}
          aria-invalid={!!errors.lens}
        />
        <div className='flex flex-wrap items-center justify-between'>
          <p id='lens-help' className='mt-1 text-xs text-foreground-muted'>
            렌즈 브랜드와 모델명을 기록해요.
          </p>
          {errors.lens && (
            <p id='lens-error' className='mt-1 text-xs text-destructive' role='alert'>
              {String(errors.lens.message)}
            </p>
          )}
        </div>
      </div>

      <div className='grid grid-cols-2 gap-x-4 pt-4'>
        <div>
          <label
            htmlFor='focalLength'
            className='mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-foreground-muted'
          >
            초점 거리
          </label>
          <div className='relative'>
            <input
              type='text'
              inputMode='decimal'
              id='focalLength'
              {...register('focalLength')}
              placeholder='예: 50'
              className='min-h-11 w-full rounded-[10px] border border-border bg-input px-3 pr-8 text-sm text-foreground placeholder:text-foreground-muted/70 transition-colors hover:border-border-hover focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20'
              aria-describedby={`focalLength-help${errors.focalLength ? ' focalLength-error' : ''}`}
              aria-invalid={!!errors.focalLength}
            />
            <span className='pointer-events-none absolute top-1/2 right-1 -translate-y-1/2 text-xs text-foreground-muted'>
              mm
            </span>
          </div>
          <p id='focalLength-help' className='mt-1 text-xs text-foreground-muted'>
            초점 거리를 mm 단위로 기록해요.
          </p>
          {errors.focalLength && (
            <p id='focalLength-error' className='mt-1 text-xs text-destructive' role='alert'>
              {String(errors.focalLength.message)}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor='aperture'
            className='mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-foreground-muted'
          >
            조리개
          </label>
          <div className='relative'>
            <span className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-xs text-foreground-muted'>
              f/
            </span>
            <input
              type='text'
              inputMode='decimal'
              id='aperture'
              {...register('aperture')}
              placeholder='예: 1.8'
              className='min-h-11 w-full rounded-[10px] border border-border bg-input px-3 pl-7 text-sm text-foreground placeholder:text-foreground-muted/70 transition-colors hover:border-border-hover focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20'
              aria-describedby={`aperture-help${errors.aperture ? ' aperture-error' : ''}`}
              aria-invalid={!!errors.aperture}
            />
          </div>
          <p id='aperture-help' className='mt-1 text-xs text-foreground-muted'>
            조리개 값을 기록해요.
          </p>
          {errors.aperture && (
            <p id='aperture-error' className='mt-1 text-xs text-destructive' role='alert'>
              {String(errors.aperture.message)}
            </p>
          )}
        </div>
      </div>
    </MetadataCard>
  );
};
