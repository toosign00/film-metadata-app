import { useState } from 'react';
import { INITIAL_SETTINGS } from '../config/constants';
import type { InitialSettings } from '../types/config.type';
import type { UseMetadataHandlersReturn } from '../types/hooks.type';

/**
 * 메타데이터 설정 관련 로직을 관리하는 커스텀 훅
 * @returns {UseMetadataHandlersReturn} 메타데이터 관련 상태와 함수들
 */
export const useMetadataHandlers = (): UseMetadataHandlersReturn => {
  const [settings, setSettings] = useState<InitialSettings>(INITIAL_SETTINGS);

  // 설정 변경 핸들러
  const handleSettingsChange = (
    name: keyof InitialSettings,
    value: InitialSettings[keyof InitialSettings]
  ): void => {
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 설정 초기화
  const resetSettings = (): void => {
    setSettings(INITIAL_SETTINGS);
  };

  return {
    settings,
    handleSettingsChange,
    resetSettings,
  };
};
