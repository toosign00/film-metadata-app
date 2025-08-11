/**
 * @module services/download/polling
 * 요청 ID 기반으로 서버의 ZIP 진행률을 폴링하여 클라이언트 진행률을 갱신합니다.
 */

export type ProgressUpdater = (value: number) => void;

/**
 * 서버 진행률 폴링을 시작합니다.
 *
 * @param {string} requestId - 서버가 인식하는 진행률 식별자
 * @param {number} totalFiles - 총 파일 수(서버가 total을 주지 않는 경우 대비)
 * @param {ProgressUpdater} updateZipProgress - 진행률(0-100)을 갱신하는 콜백
 * @returns {{ stop: () => void }} 폴링 중단 함수를 가진 객체
 */
export function startProgressPolling(
  requestId: string,
  totalFiles: number,
  updateZipProgress: ProgressUpdater
) {
  let stopped = false;

  const tick = async () => {
    if (stopped) return;
    try {
      const res = await fetch(`/api/zip?id=${encodeURIComponent(requestId)}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = (await res.json()) as { processed: number; total: number; done: boolean };
        const total = data.total || totalFiles;
        const processed = Math.min(data.processed || 0, total);
        const percent = total > 0 ? Math.min(95, Math.round((processed / total) * 95)) : 0;
        updateZipProgress(percent);
        if (data.done) return; // 완료는 호출 측에서 100%로 마무리
      }
    } catch {
      // 폴링 에러는 무시 (일시적 네트워크/캐시 문제 등)
    }
    if (!stopped) setTimeout(tick, 400);
  };

  // biome-ignore lint/nursery/noFloatingPromises: fire-and-forget polling loop
  tick();
  return {
    stop: () => {
      stopped = true;
    },
  };
}
