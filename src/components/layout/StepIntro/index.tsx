import type { StepIntroProps } from '@/types/stepIntro.types';

export const StepIntro = ({ eyebrow, title, description, titleId }: StepIntroProps) => (
  <header className='mb-8 md:mb-10'>
    <p className='text-[11px] font-semibold tracking-[0.12em] text-primary'>{eyebrow}</p>
    <h1 id={titleId} className='sr-only'>
      {title}
    </h1>
    <div className='mt-3 max-w-2xl text-sm leading-7 text-foreground-muted'>{description}</div>
  </header>
);
