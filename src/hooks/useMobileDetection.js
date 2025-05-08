import { useState, useEffect } from 'react';
import { isMobile } from 'react-device-detect';

/**
 * 모바일 기기 감지 커스텀 훅
 * @returns {boolean} 모바일 경고 표시 여부
 */
export const useMobileDetection = () => {
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setShowMobileWarning(true);
    }
  }, []);

  return showMobileWarning;
};
