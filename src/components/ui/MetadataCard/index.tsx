import type { MetadataCardProps } from '@/types/metadataCard.types';

export const MetadataCard = ({ id, eyebrow, title, description, children }: MetadataCardProps) => (
  <fieldset
    aria-labelledby={`${id}-title`}
    className='rounded-2xl border border-border bg-surface p-5 md:p-6'
  >
    <legend className='sr-only'>{title}</legend>
    <p className='text-[10px] font-semibold tracking-[0.1em] text-primary'>{eyebrow}</p>
    <h2 id={`${id}-title`} className='mt-2 text-[15px] font-semibold text-foreground'>
      {title}
    </h2>
    <p className='mt-1.5 text-xs leading-5 text-foreground-muted'>{description}</p>
    <div className='mt-5'>{children}</div>
  </fieldset>
);
