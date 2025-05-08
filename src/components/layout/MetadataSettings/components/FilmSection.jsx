import React from 'react';

const FilmSection = ({ settings, validationErrors, handleInputChange }) => {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 shadow-md" role="group" aria-labelledby="film-info-heading">
      <h3 id="film-info-heading" className="font-medium text-gray-200 mb-3 pb-2 border-b border-gray-700">
        필름 정보
      </h3>

      <div className="mb-4 relative">
        <label htmlFor="filmInfo" className="block text-gray-300 font-medium mb-1 text-sm">
          필름 정보
        </label>
        <input
          type="text"
          id="filmInfo"
          name="filmInfo"
          value={settings.filmInfo}
          onChange={handleInputChange}
          placeholder="예: Kodak Portra 400, Fuji Superia 200"
          className="w-full px-4 py-2.5 bg-gray-800 border text-gray-200 border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
          aria-describedby="filmInfo-help filmInfo-error"
          aria-required="true"
          aria-invalid={!!validationErrors.filmInfo}
        />
        <div className="flex justify-between items-center flex-wrap">
          <p id="filmInfo-help" className="mt-1 text-xs text-gray-500">
            필름 브랜드와 종류
          </p>
          {validationErrors.filmInfo && (
            <p id="filmInfo-error" className="mt-1 text-xs text-red-500" role="alert">
              {validationErrors.filmInfo}
            </p>
          )}
        </div>
      </div>

      <div className="relative">
        <label htmlFor="isoValue" className="block text-gray-300 font-medium mb-1 text-sm">
          ISO 값
        </label>
        <input
          type="text"
          id="isoValue"
          name="isoValue"
          value={settings.isoValue}
          onChange={handleInputChange}
          placeholder="예: 100, 200, 400, 800"
          className="w-full px-4 py-2.5 bg-gray-800 border text-gray-200 border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
          aria-describedby="isoValue-help isoValue-error"
          aria-required="true"
          aria-invalid={!!validationErrors.isoValue}
        />
        <div className="flex justify-between items-center flex-wrap">
          <p id="isoValue-help" className="mt-1 text-xs text-gray-500">
            필름의 ISO 감도
          </p>
          {validationErrors.isoValue && (
            <p id="isoValue-error" className="mt-1 text-xs text-red-500" role="alert">
              {validationErrors.isoValue}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilmSection;
