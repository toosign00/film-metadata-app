import React from 'react';
import Button from './ui/Button';

const MetadataSettings = ({ activeStep, settings, onSettingsChange, sortedFiles, processing, completed, formRef, goToStep, onProcessFiles }) => {
  if (activeStep !== 2) {
    return null;
  }

  return (
    <section className="mb-8 transition-all" aria-labelledby="metadata-section">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 md:p-6 shadow-md">
        <h2 id="metadata-section" className="text-xl font-bold text-gray-200 mb-4 flex items-center">
          <span className="flex items-center justify-center bg-blue-600 text-white rounded-full w-6 h-6 text-sm mr-2">2</span>
          메타데이터 설정
        </h2>

        <form ref={formRef} onSubmit={onProcessFiles} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 촬영 정보 */}
            <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 shadow-md">
              <h3 className="font-medium text-gray-200 mb-3 pb-2 border-b border-gray-700">촬영 날짜/시간</h3>

              <div className="mb-4">
                <label htmlFor="startDate" className="block text-gray-300 font-medium mb-1 text-sm">
                  시작 날짜
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={settings.startDate}
                    onChange={onSettingsChange}
                    className="w-full pl-4 pr-10 py-2.5 bg-gray-800 border text-gray-200 border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
                    required
                    aria-describedby="startDate-help"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <p id="startDate-help" className="mt-1 text-xs text-gray-500">
                  첫 번째 사진의 촬영 날짜
                </p>
              </div>

              <div>
                <label htmlFor="startTime" className="block text-gray-300 font-medium mb-1 text-sm">
                  시작 시간
                </label>
                <div className="relative">
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={settings.startTime}
                    onChange={onSettingsChange}
                    className="w-full pl-4 pr-10 py-2.5 bg-gray-800 border text-gray-200 border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
                    required
                    aria-describedby="startTime-help"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p id="startTime-help" className="mt-1 text-xs text-gray-500">
                  첫 번째 사진의 촬영 시간
                </p>
              </div>
            </div>

            {/* 카메라 정보 */}
            <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 shadow-md">
              <h3 className="font-medium text-gray-200 mb-3 pb-2 border-b border-gray-700">카메라 정보</h3>

              <div className="mb-4">
                <label htmlFor="cameraMake" className="block text-gray-300 font-medium mb-1 text-sm">
                  카메라 제조사
                </label>
                <input
                  type="text"
                  id="cameraMake"
                  name="cameraMake"
                  value={settings.cameraMake}
                  onChange={onSettingsChange}
                  placeholder="예: Canon, Nikon, Pentax"
                  className="w-full px-4 py-2.5 bg-gray-800 border text-gray-200 border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
                  aria-describedby="cameraMake-help"
                />
                <p id="cameraMake-help" className="mt-1 text-xs text-gray-500">
                  카메라 브랜드명
                </p>
              </div>

              <div>
                <label htmlFor="cameraModel" className="block text-gray-300 font-medium mb-1 text-sm">
                  카메라 모델
                </label>
                <input
                  type="text"
                  id="cameraModel"
                  name="cameraModel"
                  value={settings.cameraModel}
                  onChange={onSettingsChange}
                  placeholder="예: AE-1, F3, K1000"
                  className="w-full px-4 py-2.5 bg-gray-800 border text-gray-200 border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
                  aria-describedby="cameraModel-help"
                />
                <p id="cameraModel-help" className="mt-1 text-xs text-gray-500">
                  사용한 카메라 모델명
                </p>
              </div>
            </div>

            {/* 렌즈 정보 */}
            <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 shadow-md">
              <h3 className="font-medium text-gray-200 mb-3 pb-2 border-b border-gray-700">렌즈 정보</h3>

              <div className="mb-4">
                <label htmlFor="lens" className="block text-gray-300 font-medium mb-1 text-sm">
                  렌즈
                </label>
                <input
                  type="text"
                  id="lens"
                  name="lens"
                  value={settings.lens}
                  onChange={onSettingsChange}
                  placeholder="예: Canon FD, Nikkor AI-S"
                  className="w-full px-4 py-2.5 bg-gray-800 border text-gray-200 border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
                  aria-describedby="lens-help"
                />
                <p id="lens-help" className="mt-1 text-xs text-gray-500">
                  렌즈 브랜드와 시리즈
                </p>
              </div>

              <div>
                <label htmlFor="lensInfo" className="block text-gray-300 font-medium mb-1 text-sm">
                  렌즈 정보
                </label>
                <input
                  type="text"
                  id="lensInfo"
                  name="lensInfo"
                  value={settings.lensInfo}
                  onChange={onSettingsChange}
                  placeholder="예: 50mm f1.8, 28mm f2.8"
                  className="w-full px-4 py-2.5 bg-gray-800 border text-gray-200 border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
                  aria-describedby="lensInfo-help"
                />
                <p id="lensInfo-help" className="mt-1 text-xs text-gray-500">
                  초점 거리와 조리개 값 (예: 50mm f1.8)
                </p>
              </div>
            </div>

            {/* 필름 정보 */}
            <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 shadow-md">
              <h3 className="font-medium text-gray-200 mb-3 pb-2 border-b border-gray-700">필름 정보</h3>

              <div className="mb-4">
                <label htmlFor="filmInfo" className="block text-gray-300 font-medium mb-1 text-sm">
                  필름 정보
                </label>
                <input
                  type="text"
                  id="filmInfo"
                  name="filmInfo"
                  value={settings.filmInfo}
                  onChange={onSettingsChange}
                  placeholder="예: Kodak Portra 400, Fuji Superia 200"
                  className="w-full px-4 py-2.5 bg-gray-800 border text-gray-200 border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
                  aria-describedby="filmInfo-help"
                />
                <p id="filmInfo-help" className="mt-1 text-xs text-gray-500">
                  필름 브랜드와 종류
                </p>
              </div>

              <div>
                <label htmlFor="isoValue" className="block text-gray-300 font-medium mb-1 text-sm">
                  ISO 값
                </label>
                <input
                  type="text"
                  id="isoValue"
                  name="isoValue"
                  value={settings.isoValue}
                  onChange={onSettingsChange}
                  placeholder="예: 100, 200, 400, 800"
                  className="w-full px-4 py-2.5 bg-gray-800 border text-gray-200 border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
                  aria-describedby="isoValue-help"
                />
                <p id="isoValue-help" className="mt-1 text-xs text-gray-500">
                  필름의 ISO 감도
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <Button variant="text" type="button" onClick={() => goToStep(1)}>
              &larr; 이전
            </Button>

            <Button
              variant="primary"
              type="submit"
              disabled={processing || sortedFiles.length === 0}
              isLoading={processing && completed > 0}
              icon={
                processing && completed > 0 ? (
                  <>
                    <span>
                      {completed}/{sortedFiles.length}
                    </span>
                  </>
                ) : null
              }
            >
              메타데이터 설정하기
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default MetadataSettings;
