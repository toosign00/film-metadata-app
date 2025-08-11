'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * @module hooks/useZipProgress
 * 서버의 ZIP 생성 진행률을 `requestId` 기반으로 폴링하여 실시간 진행률을 제공합니다.
 * 폴링은 클라이언트에서만 동작하며, 컴포넌트 언마운트/ID 변경 시 자동으로 정리됩니다.
 */

export type UseZipProgressOptions = {
  /** 폴링 간격(ms). 기본 400ms */
  pollIntervalMs?: number;
  /** 시작 시 초기 진행률. 기본 1 (바 표시 목적) */
  initialPercent?: number;
};

export type UseZipProgressState = {
  /** 0-100 정수 진행률. 서버 상태에 따라 최대 95%까지 반영, 완료 시 100%는 호출 측에서 설정 */
  percent: number;
  /** 서버에서 done 신호를 받으면 true */
  isDone: boolean;
  /** 폴링 중 에러 메시지 (일시적 오류는 내부에서 무시) */
  error: string | null;
  /** 폴링 중단 함수 */
  stop: () => void;
  /** 내부 상태 초기화 함수 */
  reset: () => void;
};

/**
 * ZIP 진행률을 폴링하는 React 훅
 *
 * @param requestId 서버 진행률 트래킹용 ID (필수 시점에만 폴링 시작)
 * @param totalFiles 파일 총 개수 (서버 total 부재 시 대비)
 * @param options 폴링 설정
 * @returns 진행률/에러/제어자를 포함한 상태
 */
export function useZipProgress(
  requestId: string | null | undefined,
  totalFiles: number,
  options?: UseZipProgressOptions
): UseZipProgressState {
  const { pollIntervalMs = 400, initialPercent = 1 } = options ?? {};

  const [percent, setPercent] = useState<number>(initialPercent);
  const [isDone, setIsDone] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setPercent(initialPercent);
    setIsDone(false);
    setError(null);
  }, [clearTimer, initialPercent]);

  const stop = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  const tick = useCallback(async () => {
    if (!requestId) return;
    try {
      const res = await fetch(`/api/zip?id=${encodeURIComponent(requestId)}`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        // Not found 등은 일시적일 수 있으므로 바로 중단하지 않음
        timerRef.current = window.setTimeout(() => tick().catch(console.error), pollIntervalMs);
        return;
      }
      const data = (await res.json()) as { processed: number; total: number; done: boolean };
      const total = data.total || totalFiles;
      const processed = Math.min(data.processed || 0, total);
      const nextPercent =
        total > 0 ? Math.min(95, Math.round((processed / total) * 95)) : initialPercent;
      setPercent(nextPercent);
      setIsDone(Boolean(data.done));
      setError(null);
      if (!data.done) {
        clearTimer();
        timerRef.current = window.setTimeout(() => tick().catch(console.error), pollIntervalMs);
      }
    } catch (e) {
      // 네트워크 오류 등은 재시도
      clearTimer();
      timerRef.current = window.setTimeout(() => tick().catch(console.error), pollIntervalMs);
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [initialPercent, requestId, totalFiles, pollIntervalMs, clearTimer]);

  useEffect(() => {
    if (!requestId) return () => undefined;
    // 새 ID로 교체되면 상태 초기화 후 폴링 시작
    reset();
    tick().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : String(err));
    });
    return () => {
      clearTimer();
    };
  }, [requestId, reset, tick, clearTimer]);

  return { percent, isDone, error, stop, reset };
}
