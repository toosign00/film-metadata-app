import React, { useState } from 'react';
import Button from './ui/Button';
import CustomDatePicker from './ui/CustomDatePicker';

const MetadataSettings = ({ activeStep, settings, onSettingsChange, sortedFiles, processing, completed, formRef, goToStep, onProcessFiles }) => {
  const [validationErrors, setValidationErrors] = useState({});

  if (activeStep !== 2) {
    return null;
  }

  // 렌즈 정보 전처리 함수
  const preprocessLensInfo = (lensInfo) => {
    if (!lensInfo) return '';

    // 소문자로 변환
    let processed = lensInfo.toLowerCase();

    // f 다음의 공백 및 점(.) 제거
    processed = processed.replace(/f[\s.]+(\d+)/i, 'f$1');

    return processed;
  };

  // 엄격한 유효성 검사 함수
  const validateForm = () => {
    const errors = {};

    // 날짜 유효성 검사
    if (!settings.startDate) {
      errors.startDate = '날짜를 선택해주세요.';
    }

    // 시간 유효성 검사
    if (!settings.startTime) {
      errors.startTime = '시간을 선택해주세요.';
    }

    // 카메라 제조사 유효성 검사 (한글, 영문, 숫자 허용)
    const cameraMakeRegex = /^[a-zA-Z가-힣0-9\s]+$/;
    if (!settings.cameraMake || !cameraMakeRegex.test(settings.cameraMake)) {
      errors.cameraMake = '올바른 카메라 제조사를 입력해주세요.';
    }

    // 카메라 모델 유효성 검사 (한글, 영문, 숫자, 모든 특수문자 허용)
    const cameraModelRegex = /^[a-zA-Z0-9가-힣\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/;
    if (!settings.cameraModel || !cameraModelRegex.test(settings.cameraModel)) {
      errors.cameraModel = '올바른 카메라 모델을 입력해주세요.';
    }

    // 렌즈 유효성 검사 (한글, 영문, 숫자, 모든 특수문자 허용)
    const lensRegex = /^[a-zA-Z0-9가-힣\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/;
    if (!settings.lens || !lensRegex.test(settings.lens)) {
      errors.lens = '올바른 렌즈 정보를 입력해주세요.';
    }

    // 렌즈 정보 유효성 검사 (초점거리 + f값 형식)
    const lensInfo = settings.lensInfo;
    const processedLensInfo = preprocessLensInfo(lensInfo);

    // '/' 문자가 포함된 경우 유효성 검사 실패
    if (lensInfo && lensInfo.includes('/')) {
      errors.lensInfo = '렌즈 정보에 "/" 문자를 사용하지 마세요. (예: 50mm f1.8, 28mm f2.8)';
    } else {
      // 전처리 후 정규식 패턴 검사
      const lensInfoRegex = /^(\d+(\.\d+)?)(mm)?\s*f(\d+(\.\d+)?)$/;
      if (!lensInfo || !lensInfoRegex.test(processedLensInfo)) {
        errors.lensInfo = '렌즈 정보를 정확히 입력해주세요. (예: 50mm f1.8, 28mm f2.8)';
      }
    }

    // 필름 정보 유효성 검사 (한글, 영문, 숫자, 특수문자 허용)
    const filmInfoRegex = /^[a-zA-Z0-9가-힣\s]+\s\d+$/;
    if (!settings.filmInfo || !filmInfoRegex.test(settings.filmInfo)) {
      errors.filmInfo = '형식: Kodak Portra 400';
    }

    // ISO 값 유효성 검사 (숫자만)
    const isoRegex = /^[0-9]+$/;
    if (!settings.isoValue || !isoRegex.test(settings.isoValue)) {
      errors.isoValue = '올바른 ISO 값을 입력해주세요.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onProcessFiles(e);
    }
  };

  const handleChange = (name, value) => {
    onSettingsChange(name, value);
    if (validationErrors[name]) {
      const newErrors = { ...validationErrors };
      delete newErrors[name];
      setValidationErrors(newErrors);
    }
  };

  // 렌즈 정보 입력 처리 함수
  const handleLensInfoChange = (e) => {
    const { name, value } = e.target;

    // 사용자 입력값 그대로 UI에 표시
    handleChange(name, value);

    // 유효성 검사 오류 제거
    if (validationErrors.lensInfo) {
      const newErrors = { ...validationErrors };
      delete newErrors.lensInfo;
      setValidationErrors(newErrors);
    }
  };

  const handleDateChange = (date) => {
    handleChange('startDate', date);
  };

  const handleTimeChange = (date) => {
    handleChange('startTime', date.getTime());
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    handleChange(name, value);
  };

  return (
    <section className="mb-8 transition-all" aria-labelledby="metadata-section">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 md:p-6 shadow-md">
        <h2 id="metadata-section" className="text-xl font-bold text-gray-200 mb-4 flex items-center">
          <span className="flex items-center justify-center bg-blue-600 text-white rounded-full w-6 h-6 text-sm mr-2">2</span>
          메타데이터 설정
        </h2>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 촬영 날짜/시간 섹션 */}
            <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 shadow-md">
              <h3 className="font-medium text-gray-200 mb-3 pb-2 border-b border-gray-700">촬영 날짜/시간</h3>

              <div className="mb-4 relative">
                <label htmlFor="startDate" className="block text-gray-300 font-medium mb-1 text-sm">
                  시작 날짜
                </label>
                <CustomDatePicker
                  selected={settings.startDate}
                  onChange={handleDateChange}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="시작 날짜 선택"
                  aria-describedby="startDate-help"
                />
                <div className="flex justify-between items-center flex-wrap">
                  <p id="startDate-help" className="mt-1 text-xs text-gray-500">
                    첫 번째 사진의 촬영 날짜
                  </p>
                  {validationErrors.startDate && <p className="mt-1 text-xs text-red-500">{validationErrors.startDate}</p>}
                </div>
              </div>

              <div className="relative">
                <label htmlFor="startTime" className="block text-gray-300 font-medium mb-1 text-sm">
                  시작 시간
                </label>
                <CustomDatePicker
                  selected={new Date(settings.startTime)}
                  onChange={handleTimeChange}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={1}
                  timeFormat="HH:mm"
                  dateFormat="HH:mm"
                  placeholderText="시작 시간 선택"
                  aria-describedby="startTime-help"
                />
                <div className="flex justify-between items-center flex-wrap">
                  <p id="startTime-help" className="mt-1 text-xs text-gray-500">
                    첫 번째 사진의 촬영 시간 (사진 순서대로 1초 간격으로 설정됩니다)
                  </p>
                  {validationErrors.startTime && <p className="mt-1 text-xs text-red-500">{validationErrors.startTime}</p>}
                </div>
              </div>
            </div>

            {/* 카메라 정보 섹션 */}
            <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 shadow-md">
              <h3 className="font-medium text-gray-200 mb-3 pb-2 border-b border-gray-700">카메라 정보</h3>

              <div className="mb-4 relative">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="cameraMake" className="block text-gray-300 font-medium text-sm">
                    카메라 제조사
                  </label>
                </div>
                <input
                  type="text"
                  id="cameraMake"
                  name="cameraMake"
                  value={settings.cameraMake}
                  onChange={handleInputChange}
                  placeholder="예 : Canon, Nikon, Pentax"
                  className="w-full px-4 py-2.5 bg-gray-800 border text-gray-200 border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
                  aria-describedby="cameraMake-help"
                />
                <div className="flex justify-between items-center flex-wrap">
                  <p id="cameraMake-help" className="mt-1 text-xs text-gray-500">
                    카메라 브랜드명
                  </p>
                  {validationErrors.cameraMake && <p className="mt-1 text-xs text-red-500">{validationErrors.cameraMake}</p>}
                </div>
              </div>
              <div className="relative">
                <label htmlFor="cameraModel" className="block text-gray-300 font-medium mb-1 text-sm">
                  카메라 모델
                </label>
                <input
                  type="text"
                  id="cameraModel"
                  name="cameraModel"
                  value={settings.cameraModel}
                  onChange={handleInputChange}
                  placeholder="예 : Canon AE-1, Nikon F2, Pentax 17"
                  className="w-full px-4 py-2.5 bg-gray-800 border text-gray-200 border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
                  aria-describedby="cameraModel-help"
                />
                <div className="flex justify-between items-center flex-wrap">
                  <p id="cameraModel-help" className="mt-1 text-xs text-gray-500">
                    사용한 카메라 모델명
                  </p>
                  {validationErrors.cameraModel && <p className="mt-1 text-xs text-red-500">{validationErrors.cameraModel}</p>}
                </div>
              </div>
            </div>

            {/* 렌즈 정보 섹션 */}
            <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 shadow-md">
              <h3 className="font-medium text-gray-200 mb-3 pb-2 border-b border-gray-700">렌즈 정보</h3>

              <div className="mb-4 relative">
                <label htmlFor="lens" className="block text-gray-300 font-medium mb-1 text-sm">
                  렌즈
                </label>
                <input
                  type="text"
                  id="lens"
                  name="lens"
                  value={settings.lens}
                  onChange={handleInputChange}
                  placeholder="예: Canon FD, Nikkor AF 35mm-70mm"
                  className="w-full px-4 py-2.5 bg-gray-800 border text-gray-200 border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
                  aria-describedby="lens-help"
                />
                <div className="flex justify-between items-center flex-wrap">
                  <p id="lens-help" className="mt-1 text-xs text-gray-500">
                    렌즈 브랜드와 모델명
                  </p>
                  {validationErrors.lens && <p className="mt-1 text-xs text-red-500">{validationErrors.lens}</p>}
                </div>
              </div>

              <div className="relative">
                <label htmlFor="lensInfo" className="block text-gray-300 font-medium mb-1 text-sm">
                  렌즈 정보
                </label>
                <input
                  type="text"
                  id="lensInfo"
                  name="lensInfo"
                  value={settings.lensInfo}
                  onChange={handleLensInfoChange}
                  placeholder="예: 35mm f2.4, 28mm f2.8"
                  className="w-full px-4 py-2.5 bg-gray-800 border text-gray-200 border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
                  aria-describedby="lensInfo-help"
                />
                <div className="flex justify-between items-center flex-wrap">
                  <p id="lensInfo-help" className="mt-1 text-xs text-gray-500">
                    초점 거리와 조리개 값 (예: 50mm f2.8)
                  </p>
                  {validationErrors.lensInfo && <p className="mt-1 text-xs text-red-500">{validationErrors.lensInfo}</p>}
                </div>
              </div>
            </div>

            {/* 필름 정보 섹션 */}
            <div className="bg-gray-900 rounded-lg border border-gray-700 p-4 shadow-md">
              <h3 className="font-medium text-gray-200 mb-3 pb-2 border-b border-gray-700">필름 정보</h3>

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
                  aria-describedby="filmInfo-help"
                />
                <div className="flex justify-between items-center flex-wrap">
                  <p id="filmInfo-help" className="mt-1 text-xs text-gray-500">
                    필름 브랜드와 종류
                  </p>
                  {validationErrors.filmInfo && <p className="mt-1 text-xs text-red-500">{validationErrors.filmInfo}</p>}
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
                  aria-describedby="isoValue-help"
                />
                <div className="flex justify-between items-center flex-wrap">
                  <p id="isoValue-help" className="mt-1 text-xs text-gray-500">
                    필름의 ISO 감도
                  </p>
                  {validationErrors.isoValue && <p className="mt-1 text-xs text-red-500">{validationErrors.isoValue}</p>}
                </div>
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
