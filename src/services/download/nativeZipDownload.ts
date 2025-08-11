/**
 * @module services/download/native
 * 네이티브 브라우저 다운로드를 위해 폼/iframe을 사용하여 POST를 전송합니다.
 */

import type { NativeDownloadPayload } from '@/types/service.types';

/**
 * 폼/iframe을 이용해 `/api/zip`으로 POST 전송하여 네이티브 다운로드를 시작합니다.
 *
 * @param {NativeDownloadPayload} files - http/https 경로의 파일 목록
 * @param {string} requestId - 서버 진행률 트래킹을 위한 요청 ID
 * @param {() => void} onLoad - 다운로드 완료(스트림 종료) 시 호출되는 콜백
 */
export function submitNativeZipDownload(
  files: NativeDownloadPayload,
  requestId: string,
  onLoad: () => void
) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = '/api/zip';
  form.style.display = 'none';

  const iframeName = 'zip-download-frame';
  let iframe = document.querySelector(`iframe[name="${iframeName}"]`) as HTMLIFrameElement | null;
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.name = iframeName;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
  }
  form.target = iframeName;

  const inputFiles = document.createElement('input');
  inputFiles.type = 'hidden';
  inputFiles.name = 'files';
  inputFiles.value = JSON.stringify(files);

  const inputId = document.createElement('input');
  inputId.type = 'hidden';
  inputId.name = 'requestId';
  inputId.value = requestId;

  form.appendChild(inputFiles);
  form.appendChild(inputId);
  document.body.appendChild(form);

  const cleanup = () => {
    try {
      form.remove();
    } catch (error) {
      console.error('Failed to remove form:', error);
    }
  };

  const handleLoad = () => {
    console.log('ZIP download iframe loaded');
    cleanup();
    onLoad();
  };

  const handleError = (error: Event) => {
    console.error('ZIP download iframe error:', error);
    cleanup();
    // 에러가 발생해도 onLoad를 호출하여 처리 상태를 해제
    onLoad();
  };

  iframe.addEventListener('load', handleLoad, { once: true });
  iframe.addEventListener('error', handleError, { once: true });

  // 일정 시간 후 강제로 완료 처리 (브라우저별 차이로 인한 fallback)
  const timeoutId = setTimeout(() => {
    console.log('ZIP download timeout - forcing completion');
    iframe?.removeEventListener('load', handleLoad);
    iframe?.removeEventListener('error', handleError);
    cleanup();
    onLoad();
  }, 10000); // 10초 후 강제 완료

  // 이벤트가 정상적으로 발생하면 타임아웃 취소
  const originalOnLoad = onLoad;
  const wrappedOnLoad = () => {
    clearTimeout(timeoutId);
    originalOnLoad();
  };

  // onLoad 함수를 래핑된 버전으로 교체
  const wrappedHandleLoad = () => {
    console.log('ZIP download iframe loaded');
    cleanup();
    wrappedOnLoad();
  };

  iframe.removeEventListener('load', handleLoad);
  iframe.addEventListener('load', wrappedHandleLoad, { once: true });

  form.submit();
}
