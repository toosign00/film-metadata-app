import React from 'react';

const ImageCard = ({ image, onDownload }) => {
  return (
    <div className="relative group bg-gray-800 rounded-lg overflow-hidden shadow-md border border-gray-700">
      <div className="aspect-w-4 aspect-h-3">
        <img src={image.url} alt={`처리된 이미지: ${image.name}`} className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-300 flex items-end justify-center">
        <button
          onClick={() => onDownload(image)}
          className="mb-4 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
          aria-label={`${image.name} 다운로드`}
        >
          다운로드
        </button>
      </div>
      <div className="p-2 bg-gray-800">
        <p className="text-xs font-medium text-gray-200 truncate" title={image.name}>
          {image.name}
        </p>
        <p className="text-xs text-gray-400 truncate" title={image.dateTime}>
          {image.dateTime}
        </p>
      </div>
    </div>
  );
};

export default ImageCard;
