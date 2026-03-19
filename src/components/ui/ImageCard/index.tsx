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
    <div className='group relative overflow-hidden rounded-lg border border-border bg-surface shadow-md transition-all duration-200 hover:shadow-lg'>
      <div className='relative aspect-4/3 bg-surface-alt'>
        <Image
          src={image.url}
          alt={`처리된 이미지: ${image.name}`}
          className='object-cover transition-transform duration-300 group-hover:scale-105'
          loading='lazy'
          fill
          sizes='(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw'
          unoptimized
        />

        {!isTouch && (
          <div className='absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
            <button
              type='button'
              onClick={handleDownload}
              disabled={processing}
              className={`mb-4 translate-y-4 transform rounded-lg px-4 py-1.5 font-medium text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 group-hover:translate-y-0 ${
                processing
                  ? 'cursor-not-allowed bg-muted text-foreground-muted'
                  : 'bg-primary text-primary-foreground hover:bg-primary-hover focus:ring-ring'
              }`}
              aria-label={`${image.name} 다운로드`}
              title='다운로드'
            >
              <span className='flex items-center'>
                <Download className='mr-1' size={16} />
                다운로드
              </span>
            </button>
          </div>
        )}
      </div>

      <div className='bg-surface p-3'>
        <div className='flex items-start justify-between'>
          <div className='overflow-hidden'>
            <p className='truncate font-medium text-foreground text-sm' title={image.name}>
              {image.name}
            </p>
            {image.dateTime && (
              <p className='mt-0.5 truncate text-foreground-muted text-xs' title={image.dateTime}>
                {image.dateTime}
              </p>
            )}
          </div>
        </div>
      </div>

      {isTouch && (
        <div className='mt-0 px-3 pt-0 pb-3'>
          <button
            type='button'
            onClick={handleDownload}
            disabled={processing}
            className={`flex w-full items-center justify-center rounded py-1.5 text-xs ${
              processing
                ? 'cursor-not-allowed bg-surface text-foreground-muted'
                : 'bg-muted text-primary-muted hover:bg-border-hover hover:text-primary'
            }`}
            title='다운로드'
          >
            <Download className='mr-1' size={14} />
            파일 다운로드
          </button>
        </div>
      )}
    </div>
  );
};
