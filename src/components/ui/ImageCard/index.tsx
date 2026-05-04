'use client';

import { Download } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { isMobile, isTablet } from 'react-device-detect';
import type { ImageCardProps } from '@/types/imageCard.types';

export const ImageCard = ({ image, onDownload, processing = false }: ImageCardProps) => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(isMobile || isTablet);
  }, []);

  if (!image || !image.url) return null;

  const handleDownload = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onDownload(image);
  };

  return (
    <div className='group relative overflow-hidden rounded-lg border border-border bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.06)] transition-shadow duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]'>
      <div className='relative aspect-4/3 bg-surface-alt'>
        <Image
          src={image.url}
          alt={`처리된 이미지: ${image.name}`}
          className='object-cover'
          loading='lazy'
          fill
          sizes='(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw'
          unoptimized
        />

        {!isTouch && (
          <div className='absolute inset-0 flex items-end justify-center bg-gradient-to-t from-[rgba(17,24,39,0.75)] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
            <button
              type='button'
              onClick={handleDownload}
              disabled={processing}
              className={`mb-4 translate-y-2 transform rounded-lg px-4 py-1.5 text-sm font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:translate-y-0 ${
                processing
                  ? 'cursor-not-allowed bg-surface/60 text-foreground-muted'
                  : 'cursor-pointer bg-surface text-foreground hover:bg-surface-alt'
              }`}
              aria-label={`${image.name} 다운로드`}
            >
              <span className='flex items-center gap-1'>
                <Download size={14} />
                다운로드
              </span>
            </button>
          </div>
        )}
      </div>

      <div className='px-3 py-2.5'>
        <p className='truncate text-xs font-medium text-foreground' title={image.name}>
          {image.name}
        </p>
        {image.dateTime && (
          <p className='mt-0.5 truncate text-[11px] text-foreground-muted' title={image.dateTime}>
            {image.dateTime}
          </p>
        )}
      </div>

      {isTouch && (
        <div className='px-3 pb-3'>
          <button
            type='button'
            onClick={handleDownload}
            disabled={processing}
            className={`flex w-full items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium ${
              processing
                ? 'cursor-not-allowed bg-surface-alt text-foreground-muted'
                : 'cursor-pointer bg-surface-alt text-foreground-secondary hover:bg-muted'
            }`}
          >
            <Download size={12} />
            다운로드
          </button>
        </div>
      )}
    </div>
  );
};
