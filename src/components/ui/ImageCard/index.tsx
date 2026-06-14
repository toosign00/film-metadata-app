'use client';

import { Download } from 'lucide-react';
import Image from 'next/image';
import type { ImageCardProps } from '@/types/imageCard.types';

export const ImageCard = ({ image, onDownload, processing = false }: ImageCardProps) => {
  if (!image?.url) return null;

  return (
    <article className='overflow-hidden rounded-xl border border-border bg-surface'>
      <div className='relative aspect-4/3 overflow-hidden bg-surface-alt'>
        <Image
          src={image.url}
          alt={`메타데이터가 적용된 ${image.name}`}
          className='object-cover'
          fill
          loading='lazy'
          sizes='(max-width: 479px) 100vw, (max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw'
          unoptimized
        />
      </div>

      <div className='flex items-center justify-between gap-3 p-3'>
        <div className='min-w-0'>
          <h2 className='truncate text-xs font-medium text-foreground' title={image.name}>
            {image.name}
          </h2>
          {image.dateTime && (
            <p className='mt-1 truncate text-[11px] text-foreground-muted' title={image.dateTime}>
              {image.dateTime}
            </p>
          )}
        </div>
        <button
          type='button'
          onClick={() => onDownload(image)}
          disabled={processing}
          className='grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-[10px] border border-border text-foreground-muted transition-colors hover:bg-surface-alt hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40'
          aria-label={`${image.name} 다운로드`}
        >
          <Download size={16} aria-hidden='true' />
        </button>
      </div>
    </article>
  );
};
