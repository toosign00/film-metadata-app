/**
 * @module services/download/native
 * 네이티브 브라우저 다운로드를 위해 폼/iframe을 사용하여 POST를 전송합니다.
 */

export type NativeDownloadPayload = Array<{ url: string; name: string }>;

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

  const handleLoad = () => {
    onLoad();
    try {
      form.remove();
    } catch (error) {
      console.error('Failed to remove form:', error);
    }
    iframe?.removeEventListener('load', handleLoad);
  };
  iframe.addEventListener('load', handleLoad, { once: true });
  form.submit();
}
