import { useEffect } from 'react';

/**
 * 특정 요소 외부 클릭을 감지하는 훅
 * @param {React.MutableRefObject} ref - 참조 객체
 * @param {Function} callback - 외부 클릭 시 실행할 콜백 함수
 */
const useClickOutside = (ref, callback) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
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
