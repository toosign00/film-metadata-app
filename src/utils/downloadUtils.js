/**
 * @fileoverview 파일 다운로드 유틸리티 모듈
 * 단일 파일 및 ZIP 압축 파일 다운로드 기능을 제공합니다.
 * @module DownloadUtil
 */

import { isMobile, isSafari, isChrome, browserName } from 'react-device-detect';
import { saveAs } from 'file-saver';

/** 로그 출력 여부 설정 */
const ENABLE_LOGGING = true;

/**
 * 디버그 로그를 출력합니다
 * @param {string} message - 로그 메시지
 * @param {any} [data] - 추가 데이터 (선택적)
 */
const debug = (message, data) => {
  if (ENABLE_LOGGING) {
    if (data !== undefined) {
      console.log(`[DownloadUtil] ${message}`, data);
    } else {
      console.log(`[DownloadUtil] ${message}`);
    }
  }
};

/**
 * ZIP 스트리밍 설정 객체
 * @typedef {Object} StreamingOptions
 * @property {number} batchSize - 동시 처리할 파일 수
 * @property {number} delayBetweenBatches - 배치 간 딜레이 (ms)
 * @property {number} chunkSize - 청크 크기 (바이트)
 * @property {number} maxFetchRetries - 최대 재시도 횟수
 * @property {number} fetchTimeout - 요청 타임아웃 (ms)
 * @property {number} retryDelay - 재시도 딜레이 (ms)
 */
const STREAMING_OPTIONS = {
  batchSize: 10,
  delayBetweenBatches: 100,
  chunkSize: isSafari ? 512 * 1024 : 2 * 1024 * 1024,
  maxFetchRetries: 3,
  fetchTimeout: 30000,
  retryDelay: 1000,
};

/**
 * 단일 파일 다운로드 함수
 * @param {Object} image - 다운로드할 이미지 객체
 * @param {string} image.url - 이미지 URL
 * @param {string} [image.name] - 저장할 파일명
 * @returns {Promise<void>}
 */
export const downloadFile = (image) => {
  try {
    if (!image || !image.url) {
      throw new Error('다운로드할 이미지 정보가 없습니다');
    }

    fetch(image.url)
      .then((response) => response.blob())
      .then((blob) => {
        saveAs(blob, image.name || 'download');
      })
      .catch((error) => {
        throw error;
      });
  } catch (error) {
    console.error('[DownloadUtil] 파일 다운로드 오류:', error);
    alert(`파일 다운로드 중 오류가 발생했습니다: ${error.message}`);
  }
};

/**
 * ZIP 파일을 다운로드합니다
 * @param {Blob} blob - ZIP 파일 Blob
 * @param {number} fileCount - 압축된 파일 개수
 */
const downloadZipFile = (blob, fileCount) => {
  try {
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const zipFileName = `film_metadata_${timestamp}.zip`;

    debug(`다운로드 시작 (브라우저: ${browserName}, 모바일: ${isMobile})`);

    if (isChrome) {
      debug('Chrome 브라우저 감지됨, 특별 처리 적용');

      const a = document.createElement('a');
      a.href = url;
      a.download = zipFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (isSafari) {
      debug('Safari 브라우저 감지됨, MIME 타입 변경');
      const blobWithCorrectType = new Blob([blob], {
        type: 'application/octet-stream',
      });
      saveAs(blobWithCorrectType, zipFileName, { autoBom: true });
    } else {
      debug(`${browserName} 브라우저 감지됨, 기본 방식 사용`);
      saveAs(blob, zipFileName);
    }

    alert(`${fileCount}개 파일이 성공적으로 ZIP으로 압축되었습니다.`);
  } catch (error) {
    console.error('[DownloadUtil] ZIP 파일 다운로드 오류:', error);
    alert(`ZIP 파일 다운로드 중 오류가 발생했습니다: ${error.message}`);
  }
};

/**
 * 여러 이미지를 ZIP으로 압축하여 다운로드합니다
 * @param {Array<Object>} validImages - 다운로드할 이미지 객체 배열
 * @param {Function} updateZipProgress - 압축 진행률 업데이트 콜백 (0-100)
 * @param {Function} updateProcessing - 처리 상태 업데이트 콜백
 * @param {Function} updateIsZipCompressing - 압축 상태 업데이트 콜백
 * @returns {Promise<void>}
 */
export const createZipFile = async (validImages, updateZipProgress, updateProcessing, updateIsZipCompressing) => {
  if (!validImages || !Array.isArray(validImages) || validImages.length === 0) {
    alert('다운로드할 이미지가 없습니다.');
    return;
  }

  updateProcessing(true);
  updateZipProgress(0);
  updateIsZipCompressing(true);

  let worker = null;
  let zipChunks = [];

  /**
   * 오류 처리 함수
   * @param {string} message - 오류 메시지
   */
  const handleError = (message) => {
    console.error('ZIP 오류:', message);
    alert(`ZIP 파일 생성 중 오류가 발생했습니다: ${message}`);

    if (worker) {
      try {
        worker.terminate();
      } catch (e) {
        console.error('워커 종료 중 오류:', e);
      }
      worker = null;
    }

    updateProcessing(false);
    updateIsZipCompressing(false);
    updateZipProgress(0);
  };

  try {
    worker = new Worker(new URL('../workers/zipWorker.js', import.meta.url), { type: 'module' });

    let processedCount = 0;
    const totalFiles = validImages.length;
    const FILE_PROCESSING_WEIGHT = 75;
    const COMPRESSION_WEIGHT = 25;

    return new Promise((resolve, reject) => {
      worker.onmessage = (event) => {
        const { type, payload } = event.data;

        switch (type) {
          case 'READY':
            processFiles().catch((error) => {
              handleError(error.message);
              reject(error);
            });
            break;

          case 'ZIP_DATA':
            if (payload.data) {
              zipChunks.push(new Uint8Array(payload.data));
            }
            if (payload.final) {
              finishDownload();
              resolve();
            }
            break;

          case 'FILE_ADDED':
            processedCount = Math.min(processedCount + 1, totalFiles);
            const fileProgress = Math.min((processedCount / totalFiles) * FILE_PROCESSING_WEIGHT, FILE_PROCESSING_WEIGHT);
            updateZipProgress(Math.round(fileProgress));
            break;

          case 'COMPRESSION_PROGRESS':
            const compressionPercent = payload.percent || 0;
            const compressionProgress = (compressionPercent / 100) * COMPRESSION_WEIGHT;
            const totalProgress = Math.min(Math.round((processedCount / totalFiles) * FILE_PROCESSING_WEIGHT + compressionProgress), 100);
            updateZipProgress(totalProgress);
            break;

          case 'ERROR':
            handleError(payload.message);
            reject(new Error(payload.message));
            break;
        }
      };

      worker.onerror = (error) => {
        const errorMessage = `웹 워커 오류: ${error.message || '알 수 없는 오류'}`;
        handleError(errorMessage);
        reject(new Error(errorMessage));
      };

      worker.postMessage({ type: 'START_ZIP' });
    });

    /**
     * 파일 일괄 처리 함수
     * @async
     */
    async function processFiles() {
      const maxConcurrent = STREAMING_OPTIONS.batchSize;

      for (let i = 0; i < validImages.length; i += maxConcurrent) {
        const batch = validImages.slice(i, i + maxConcurrent);
        const promises = batch.map(processFile);
        await Promise.allSettled(promises);

        if (i + maxConcurrent < validImages.length) {
          await new Promise((resolve) => setTimeout(resolve, STREAMING_OPTIONS.delayBetweenBatches));
        }
      }

      if (worker) {
        worker.postMessage({ type: 'FINISH_ZIP' });
      }
    }

    /**
     * 단일 파일 처리 함수
     * @async
     * @param {Object} image - 이미지 객체
     */
    async function processFile(image) {
      try {
        if (!worker) return;

        const fileName = image.name || `image_${validImages.indexOf(image) + 1}.jpg`;
        let response;
        let retryCount = 0;

        while (retryCount <= STREAMING_OPTIONS.maxFetchRetries) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), STREAMING_OPTIONS.fetchTimeout);

            response = await fetch(image.url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (response.ok) {
              break;
            }
            throw new Error('응답이 올바르지 않습니다');
          } catch (error) {
            retryCount++;
            if (retryCount > STREAMING_OPTIONS.maxFetchRetries) {
              throw new Error(`파일 다운로드 실패 (${retryCount}회 시도): ${fileName}`);
            }
            await new Promise((resolve) => setTimeout(resolve, STREAMING_OPTIONS.retryDelay * retryCount));
            continue;
          }
        }

        const blob = await response.blob();
        const maxChunkSize = STREAMING_OPTIONS.chunkSize;
        let cursor = 0;

        while (cursor < blob.size) {
          if (!worker) break;

          const nextWindow = Math.min(blob.size, cursor + maxChunkSize);
          const chunk = await blob.slice(cursor, nextWindow).arrayBuffer();
          const isLast = nextWindow >= blob.size;

          worker.postMessage(
            {
              type: 'ADD_FILE_CHUNK',
              payload: {
                name: fileName,
                data: chunk,
                isLast,
                totalSize: blob.size,
                currentPosition: cursor,
              },
            },
            [chunk]
          );

          cursor = nextWindow;

          // Safari에서는 더 긴 딜레이 사용
          await new Promise((resolve) => setTimeout(resolve, isSafari ? 30 : 10));
        }
      } catch (error) {
        console.error(`파일 처리 오류 (${image.name || '이미지'}):`, error);
        throw error;
      }
    }

    /**
     * 다운로드 완료 처리 함수
     */
    function finishDownload() {
      try {
        const totalSize = zipChunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const finalZipData = new Uint8Array(totalSize);
        let offset = 0;

        for (const chunk of zipChunks) {
          finalZipData.set(chunk, offset);
          offset += chunk.length;
        }

        // 브라우저에 맞게 MIME 타입 설정
        const blob = new Blob([finalZipData], {
          type: 'application/zip',
        });

        downloadZipFile(blob, validImages.length);

        // 정리
        zipChunks = [];
        if (worker) {
          worker.terminate();
          worker = null;
        }

        updateProcessing(false);
        updateIsZipCompressing(false);
        updateZipProgress(100);
      } catch (error) {
        handleError(`ZIP 파일 생성 중 오류: ${error.message}`);
      }
    }
  } catch (error) {
    handleError(error.message);
  }
};
