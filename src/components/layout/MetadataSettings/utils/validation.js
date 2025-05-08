import { preprocessLensInfo } from './preprocessors';

export const validateForm = (settings) => {
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
  const filmInfoRegex = /^[a-zA-Z0-9가-힣\s]+(\s\d+)?$/;
  if (!settings.filmInfo || !filmInfoRegex.test(settings.filmInfo)) {
    errors.filmInfo = '형식: Kodak Portra 400';
  }

  // ISO 값 유효성 검사 (숫자만)
  const isoRegex = /^[0-9]+$/;
  if (!settings.isoValue || !isoRegex.test(settings.isoValue)) {
    errors.isoValue = '올바른 ISO 값을 입력해주세요.';
  }

  return errors;
};
