import { type RefObject, useEffect } from 'react';

/**
 * 특정 요소 외부 클릭을 감지하는 훅
 * @param {RefObject<HTMLElement>} ref - 감시할 요소의 ref
 * @param {() => void} callback - 외부 클릭 시 실행할 콜백 함수
 */
const useClickOutside = (ref: RefObject<HTMLElement>, callback: () => void): void => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
};

export default useClickOutside;
