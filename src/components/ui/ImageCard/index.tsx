import React, { useEffect, useState } from 'react';
import { isMobile, isTablet } from 'react-device-detect';
import { ImageCardProps } from '../../../types/imageCard.type';

const ImageCard: React.FC<ImageCardProps> = ({ image, onDownload, disabled = false }) => {
  const [isTouch, setIsTouch] = useState(false);

  // 컴포넌트 마운트 시 터치 디바이스 여부 확인
  useEffect(() => {
    setIsTouch(isMobile || isTablet);
  }, []);

  if (!image || !image.url) return null;

  const handleDownload = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    onDownload(image);
  };

  return (
    <div className="relative group bg-gray-800 rounded-lg overflow-hidden shadow-md border border-gray-700 transition-all duration-200 hover:shadow-lg">
      <div className="aspect-w-4 aspect-h-3 bg-gray-900">
        <img
          src={image.url}
          alt={`처리된 이미지: ${image.name}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* 오버레이 및 다운로드 버튼 - 터치 디바이스가 아닌 경우에만 표시 */}
        {!isTouch && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center">
            <button
              onClick={handleDownload}
              disabled={disabled}
              className={`
                mb-4 px-4 py-1.5 rounded-lg text-sm font-medium 
                transform translate-y-4 group-hover:translate-y-0 transition-all duration-300
                focus:outline-none focus:ring-2 focus:ring-offset-1
                ${disabled ? 'bg-gray-600 text-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'}
              `}
              aria-label={disabled ? '다운로드 불가' : `${image.name} 다운로드`}
              title={disabled ? '다운로드가 완료되었습니다. 메타데이터 설정부터 다시 해주세요.' : '다운로드'}
            >
              {disabled ? (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  다운로드 완료
                </span>
              ) : (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  다운로드
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* 이미지 정보 */}
      <div className="p-3 bg-gray-800">
        <div className="flex justify-between items-start">
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-gray-200 truncate" title={image.name}>
              {image.name}
            </p>
            {image.dateTime && (
              <p className="text-xs text-gray-400 mt-0.5 truncate" title={image.dateTime}>
                {image.dateTime}
              </p>
            )}
          </div>

          {/* 다운로드 상태 배지 - 항상 표시 */}
          {disabled && (
            <span className="ml-1 flex-shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              완료
            </span>
          )}
        </div>
      </div>

      {/* 모바일 다운로드 버튼 - 터치 디바이스일 경우에만 표시 */}
      {isTouch && (
        <div className="px-3 pb-3 pt-0 mt-0">
          <button
            onClick={handleDownload}
            disabled={disabled}
            className={`
              w-full text-xs py-1.5 rounded flex items-center justify-center
              ${disabled ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600 text-blue-400 hover:text-blue-300'}
            `}
            title={disabled ? '다운로드가 완료되었습니다. 메타데이터 설정부터 다시 해주세요.' : '다운로드'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {disabled ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              )}
            </svg>
            {disabled ? '다운로드 완료' : '파일 다운로드'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageCard;
