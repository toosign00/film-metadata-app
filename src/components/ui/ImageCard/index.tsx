import { useEffect, useState } from 'react';
import { isMobile, isTablet } from 'react-device-detect';
import { ImageCardProps } from '@/types/imageCard.type';

export const ImageCard = ({ image, onDownload, disabled = false }: ImageCardProps) => {
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
    <div className="group relative overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-md transition-all duration-200 hover:shadow-lg">
      <div className="aspect-w-4 aspect-h-3 bg-gray-900">
        <img
          src={image.url}
          alt={`처리된 이미지: ${image.name}`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* 오버레이 및 다운로드 버튼 - 터치 디바이스가 아닌 경우에만 표시 */}
        {!isTouch && (
          <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/80 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <button
              onClick={handleDownload}
              disabled={disabled}
              className={`mb-4 translate-y-4 transform rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-300 group-hover:translate-y-0 focus:ring-2 focus:ring-offset-1 focus:outline-none ${disabled ? 'cursor-not-allowed bg-gray-600 text-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'} `}
              aria-label={disabled ? '다운로드 불가' : `${image.name} 다운로드`}
              title={
                disabled
                  ? '다운로드가 완료되었습니다. 메타데이터 설정부터 다시 해주세요.'
                  : '다운로드'
              }
            >
              {disabled ? (
                <span className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-1 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-1 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
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
      <div className="bg-gray-800 p-3">
        <div className="flex items-start justify-between">
          <div className="overflow-hidden">
            <p className="truncate text-sm font-medium text-gray-200" title={image.name}>
              {image.name}
            </p>
            {image.dateTime && (
              <p className="mt-0.5 truncate text-xs text-gray-400" title={image.dateTime}>
                {image.dateTime}
              </p>
            )}
          </div>

          {/* 다운로드 상태 배지 - 항상 표시 */}
          {disabled && (
            <span className="ml-1 inline-flex flex-shrink-0 items-center rounded-full bg-gray-700 px-1.5 py-0.5 text-xs font-medium text-gray-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-0.5 h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              완료
            </span>
          )}
        </div>
      </div>

      {/* 모바일 다운로드 버튼 - 터치 디바이스일 경우에만 표시 */}
      {isTouch && (
        <div className="mt-0 px-3 pt-0 pb-3">
          <button
            onClick={handleDownload}
            disabled={disabled}
            className={`flex w-full items-center justify-center rounded py-1.5 text-xs ${disabled ? 'cursor-not-allowed bg-gray-700 text-gray-500' : 'bg-gray-700 text-blue-400 hover:bg-gray-600 hover:text-blue-300'} `}
            title={
              disabled
                ? '다운로드가 완료되었습니다. 메타데이터 설정부터 다시 해주세요.'
                : '다운로드'
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-1 h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
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
