import { FilmSectionProps } from '@/types/metadata-settings.type';

export const FilmSection = ({
  settings,
  validationErrors,
  handleInputChange: handleInputChange,
}: FilmSectionProps) => {
  return (
    <div
      className="rounded-lg border border-gray-700 bg-gray-900 p-4 shadow-md"
      role="group"
      aria-labelledby="film-info-heading"
    >
      <h3
        id="film-info-heading"
        className="mb-3 border-b border-gray-700 pb-2 font-medium text-gray-200"
      >
        필름 정보
      </h3>

      <div className="relative mb-4">
        <label htmlFor="filmInfo" className="mb-1 block text-sm font-medium text-gray-300">
          필름 정보
        </label>
        <input
          type="text"
          id="filmInfo"
          name="filmInfo"
          value={settings.filmInfo}
          onChange={handleInputChange}
          placeholder="예: Kodak Portra 400, Fuji Superia 200"
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          aria-describedby="filmInfo-help filmInfo-error"
          aria-required="true"
          aria-invalid={!!validationErrors.filmInfo}
        />
        <div className="flex flex-wrap items-center justify-between">
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
        <label htmlFor="isoValue" className="mb-1 block text-sm font-medium text-gray-300">
          ISO 값
        </label>
        <input
          type="text"
          id="isoValue"
          name="isoValue"
          value={settings.isoValue}
          onChange={handleInputChange}
          placeholder="예: 100, 200, 400, 800"
          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          aria-describedby="isoValue-help isoValue-error"
          aria-required="true"
          aria-invalid={!!validationErrors.isoValue}
        />
        <div className="flex flex-wrap items-center justify-between">
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
