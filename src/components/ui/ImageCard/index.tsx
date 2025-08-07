import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { isMobile, isTablet } from 'react-device-detect';
import type { ImageCardProps } from '@/types/imageCard.type';

export const ImageCard = ({ image, onDownload }: ImageCardProps) => {
  const [isTouch, setIsTouch] = useState(false);

  // 컴포넌트 마운트 시 터치 디바이스 여부 확인
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
    <div className='group relative overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-md transition-all duration-200 hover:shadow-lg'>
      <div className='aspect-w-4 aspect-h-3 bg-gray-900'>
        <img
          src={image.url}
          alt={`처리된 이미지: ${image.name}`}
          className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
          loading='lazy'
        />

        {/* 오버레이 및 다운로드 버튼 - 터치 디바이스가 아닌 경우에만 표시 */}
        {!isTouch && (
          <div className='absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
            <button
              type='button'
              onClick={handleDownload}
              className='mb-4 translate-y-4 transform rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-300 group-hover:translate-y-0 focus:ring-2 focus:ring-offset-1 focus:outline-none bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
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

      {/* 이미지 정보 */}
      <div className='bg-gray-800 p-3'>
        <div className='flex items-start justify-between'>
          <div className='overflow-hidden'>
            <p className='truncate text-sm font-medium text-gray-200' title={image.name}>
              {image.name}
            </p>
            {image.dateTime && (
              <p className='mt-0.5 truncate text-xs text-gray-400' title={image.dateTime}>
                {image.dateTime}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 모바일 다운로드 버튼 - 터치 디바이스일 경우에만 표시 */}
      {isTouch && (
        <div className='mt-0 px-3 pt-0 pb-3'>
          <button
            type='button'
            onClick={handleDownload}
            className='flex w-full items-center justify-center rounded py-1.5 text-xs bg-gray-700 text-blue-400 hover:bg-gray-600 hover:text-blue-300'
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
