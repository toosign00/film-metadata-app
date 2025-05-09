import { useState } from 'react';
import { INITIAL_SETTINGS, MetadataSettings } from '../config/constants';

interface UseMetadataHandlersReturn {
  settings: MetadataSettings;
  handleSettingsChange: (name: keyof MetadataSettings, value: MetadataSettings[keyof MetadataSettings]) => void;
  resetSettings: () => void;
}

/**
 * 메타데이터 설정 관련 로직을 관리하는 커스텀 훅
 * @returns 메타데이터 관련 상태와 함수들
 */
export const useMetadataHandlers = (): UseMetadataHandlersReturn => {
  const [settings, setSettings] = useState<MetadataSettings>(INITIAL_SETTINGS);

  const handleSettingsChange = (name: keyof MetadataSettings, value: MetadataSettings[keyof MetadataSettings]) => {
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetSettings = () => {
    setSettings(INITIAL_SETTINGS);
  };

  return {
    settings,
    handleSettingsChange,
    resetSettings,
  };
};
