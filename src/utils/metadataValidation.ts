import type { MetadataSettings } from '@/types/metadata.type';
import { preprocessLensInfo } from '@/utils/lensUtils';

export interface ValidationErrors {
  [key: string]: string;
}

export const validateForm = (settings: MetadataSettings): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!settings.startDate) {
    errors.startDate = '날짜를 선택해주세요.';
  }

  if (!settings.startTime) {
    errors.startTime = '시간을 선택해주세요.';
  }

  const cameraMakeRegex = /^[a-zA-Z가-힣0-9\s]+$/;
  if (!settings.cameraMake || !cameraMakeRegex.test(settings.cameraMake)) {
    errors.cameraMake = '올바른 카메라 제조사를 입력해주세요.';
  }

  const cameraModelRegex = /^[a-zA-Z0-9가-힣\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/;
  if (!settings.cameraModel || !cameraModelRegex.test(settings.cameraModel)) {
    errors.cameraModel = '올바른 카메라 모델을 입력해주세요.';
  }

  const lensRegex = /^[a-zA-Z0-9가-힣\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/;
  if (!settings.lens || !lensRegex.test(settings.lens)) {
    errors.lens = '올바른 렌즈 정보를 입력해주세요.';
  }

  const lensInfo = settings.lensInfo;
  const processedLensInfo = preprocessLensInfo(lensInfo);
  if (lensInfo?.includes('/')) {
    errors.lensInfo = '렌즈 정보에 "/" 문자를 사용하지 마세요. (예: 50mm f1.8, 28mm f2.8)';
  } else {
    const lensInfoRegex = /^(\d+(\.\d+)?)(mm)?\s*f(\d+(\.\d+)?)$/;
    if (!lensInfo || !lensInfoRegex.test(processedLensInfo)) {
      errors.lensInfo = '렌즈 정보를 정확히 입력해주세요. (예: 50mm f1.8, 28mm f2.8)';
    }
  }

  const filmInfoRegex = /^[a-zA-Z0-9가-힣\s]+(\s\d+)?$/;
  if (!settings.filmInfo || !filmInfoRegex.test(settings.filmInfo)) {
    errors.filmInfo = '형식: Kodak Portra 400';
  }

  const isoRegex = /^[0-9]+$/;
  if (!settings.isoValue || !isoRegex.test(settings.isoValue)) {
    errors.isoValue = '올바른 ISO 값을 입력해주세요.';
  }

  return errors;
};
