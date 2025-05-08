import { useState } from 'react';
import { INITIAL_SETTINGS } from '../config/constants';

/**
 * 메타데이터 설정 관련 로직을 관리하는 커스텀 훅
 * @returns {Object} 메타데이터 관련 상태와 함수들
 */
export const useMetadataHandlers = () => {
  const [settings, setSettings] = useState(INITIAL_SETTINGS);

  // 설정 변경 핸들러
  const handleSettingsChange = (name, value) => {
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 설정 초기화
  const resetSettings = () => {
    setSettings(INITIAL_SETTINGS);
  };

  return {
    settings,
    handleSettingsChange,
    resetSettings,
  };
};
