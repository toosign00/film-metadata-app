import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseChunkProgressOptions {
  pollIntervalMs?: number;
  initialPercent?: number;
}

export interface UseChunkProgressState {
  progress: number;
  uploadedChunks: number;
  totalChunks: number;
  isComplete: boolean;
  error: string | null;
  stop: () => void;
  reset: () => void;
}

export function useChunkProgress(
  fileId: string | null | undefined,
  totalChunks: number,
  options: UseChunkProgressOptions = {}
): UseChunkProgressState {
  const { pollIntervalMs = 1000, initialPercent = 0 } = options;

  const [progress, setProgress] = useState(initialPercent);
  const [uploadedChunks, setUploadedChunks] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<number | undefined>(undefined);
  const stoppedRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  const stop = useCallback(() => {
    stoppedRef.current = true;
    clearTimer();
  }, [clearTimer]);

  const reset = useCallback(() => {
    stoppedRef.current = false;
    setProgress(initialPercent);
    setUploadedChunks(0);
    setIsComplete(false);
    setError(null);
    clearTimer();
  }, [initialPercent, clearTimer]);

  const tick = useCallback(async () => {
    if (!fileId || stoppedRef.current) return;

    try {
      const res = await fetch(`/api/upload-chunk?fileId=${encodeURIComponent(fileId)}`, {
        cache: 'no-store',
      });

      if (!res.ok) {
        timerRef.current = window.setTimeout(() => tick().catch(console.error), pollIntervalMs);
        return;
      }

      const data = (await res.json()) as {
        uploadedChunks: number;
        totalChunks: number;
        isComplete: boolean;
      };

      const total = data.totalChunks || totalChunks;
      const uploaded = Math.min(data.uploadedChunks || 0, total);
      const nextPercent = total > 0 ? Math.round((uploaded / total) * 100) : initialPercent;

      setProgress(nextPercent);
      setUploadedChunks(uploaded);
      setIsComplete(Boolean(data.isComplete));
      setError(null);

      if (!data.isComplete && !stoppedRef.current) {
        clearTimer();
        timerRef.current = window.setTimeout(() => tick().catch(console.error), pollIntervalMs);
      }
    } catch (e) {
      if (!stoppedRef.current) {
        clearTimer();
        timerRef.current = window.setTimeout(() => tick().catch(console.error), pollIntervalMs);
        setError(e instanceof Error ? e.message : String(e));
      }
    }
  }, [fileId, totalChunks, pollIntervalMs, initialPercent, clearTimer]);

  useEffect(() => {
    if (!fileId) return () => undefined;

    reset();
    tick().catch((err: unknown) => {
      setError(err instanceof Error ? err.message : String(err));
    });

    return () => {
      clearTimer();
    };
  }, [fileId, reset, tick, clearTimer]);

  return {
    progress,
    uploadedChunks,
    totalChunks,
    isComplete,
    error,
    stop,
    reset,
  };
}
