import { isMobile } from 'react-device-detect';

// 로그 메세지 출력 여부 설정
const ENABLE_LOGGING = true;

// Safari 감지
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

const debug = (message, data) => {
  if (ENABLE_LOGGING) {
    if (data !== undefined) {
      console.log(`[DownloadUtil] ${message}`, data);
    } else {
      console.log(`[DownloadUtil] ${message}`);
    }
  }
};

// Safari 디버깅을 위한 코드
if (isSafari) {
  debug('Safari 환경에서 실행 중입니다.');
  window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('WebKitBlobResource')) {
      debug('WebKitBlobResource 오류 발생:', event);
    }
  });
}

// ZIP 스트리밍 설정 - Safari 최적화 적용
const STREAMING_OPTIONS = {
  // 동시 처리할 파일 수 (Safari에서는 줄임)
  batchSize: isSafari ? 5 : 10,
  // 배치 간 딜레이 (Safari에서는 늘림)
  delayBetweenBatches: isSafari ? 200 : 100,
  // 청크 크기 (Safari에서는 줄임)
  chunkSize: isSafari ? 1 * 1024 * 1024 : 2 * 1024 * 1024,
  // 최대 재시도 횟수
  maxFetchRetries: 3,
  // 요청 타임아웃 (ms)
  fetchTimeout: 30000,
  // 재시도 딜레이 (ms)
  retryDelay: 1000,
};

/**
 * 단일 파일 다운로드 함수
 */
export const downloadFile = (image) => {
  try {
    if (!image || !image.url) {
      throw new Error('다운로드할 이미지 정보가 없습니다');
    }

    // Safari를 위한 분기 처리
    if (isSafari) {
      safariFriendlyDownload(image.url, image.name || 'download');
    } else {
      const a = document.createElement('a');
      a.href = image.url;
      a.download = image.name || 'download';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  } catch (error) {
    console.error('[DownloadUtil] 파일 다운로드 오류:', error);
    alert(`파일 다운로드 중 오류가 발생했습니다: ${error.message}`);
  }
};

// Safari용 대체 다운로드 함수 추가
const safariFriendlyDownload = (url, filename) => {
  debug('Safari 친화적 다운로드 사용 중...');

  // 이미 Blob URL인지 확인
  if (url.startsWith('blob:')) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank'; // Safari에서 중요
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // 외부 URL인 경우 먼저 Blob으로 가져옴
  fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      // 5MB 미만인 경우 Data URL 사용
      if (blob.size < 5 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result;
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = filename;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        };
        reader.readAsDataURL(blob);
      } else {
        // 큰 파일은 새 창에서 Blob URL 열기
        const blobUrl = URL.createObjectURL(blob);

        if (isMobile) {
          window.location.href = blobUrl;
        } else {
          window.open(blobUrl, '_blank');
        }

        // 충분히 긴 시간 후에 URL 해제
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000); // 1분 후 해제
      }
    })
    .catch((error) => {
      console.error('[DownloadUtil] Safari 다운로드 오류:', error);
      alert(`파일 다운로드 중 오류가 발생했습니다: ${error.message}`);
    });
};

const downloadZipFile = (blob, fileCount) => {
  try {
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const zipFileName = `film_metadata_${timestamp}.zip`;

    const url = URL.createObjectURL(blob);

    // Safari 호환성을 위한 다운로드 처리
    if (isSafari) {
      debug('Safari에서 ZIP 다운로드 처리 중...');

      if (isMobile) {
        // Safari 모바일에서는 새 창에서 열기
        window.location.href = url;
      } else {
        // Safari 데스크톱에서는 새 창 열기
        const newWindow = window.open(url, '_blank');
        if (!newWindow) {
          alert('팝업이 차단되었습니다. 팝업 차단을 해제하고 다시 시도해주세요.');
        }
      }

      // 더 긴 시간 이후에 URL 해제 (Safari가 다운로드를 시작하기에 충분한 시간)
      setTimeout(() => URL.revokeObjectURL(url), 60000); // 1분 후 해제
    } else {
      // 다른 브라우저에서는 기존 방식 사용
      const a = document.createElement('a');
      a.href = url;
      a.download = zipFileName;

      // 클릭 이벤트 리스너로 다운로드 완료 후 URL 해제
      a.addEventListener(
        'click',
        () => {
          // 다운로드 시작 후 지연 시간을 더 길게 설정
          setTimeout(() => URL.revokeObjectURL(url), 3000);
        },
        { once: true }
      );

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    alert(`${fileCount}개 파일이 성공적으로 ZIP으로 압축되었습니다.`);
  } catch (error) {
    console.error('[DownloadUtil] ZIP 파일 다운로드 오류:', error);
    alert(`ZIP 파일 다운로드 중 오류가 발생했습니다: ${error.message}`);
  }
};

/**
 * 모든 결과 파일 ZIP으로 다운로드 (스트리밍 방식)
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

        // Safari에서 큰 파일 처리 최적화
        const totalChunks = Math.ceil(blob.size / maxChunkSize);
        if (isSafari && totalChunks > 50) {
          debug(`Safari에서 큰 파일 처리 중 (${fileName}): ${blob.size} 바이트, ${totalChunks} 청크`);
        }

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

          // Safari에서는 각 청크 처리 후 더 긴 딜레이 추가
          await new Promise((resolve) => setTimeout(resolve, isSafari ? 30 : 10));
        }
      } catch (error) {
        console.error(`파일 처리 오류 (${image.name || '이미지'}):`, error);
        throw error;
      }
    }

    function finishDownload() {
      try {
        const totalSize = zipChunks.reduce((sum, chunk) => sum + chunk.length, 0);

        debug(`ZIP 파일 생성 완료: ${totalSize} 바이트`);

        if (isSafari && totalSize > 100 * 1024 * 1024) {
          debug('Safari에서 큰 ZIP 파일 처리중 (>100MB)');
        }

        const finalZipData = new Uint8Array(totalSize);
        let offset = 0;

        for (const chunk of zipChunks) {
          finalZipData.set(chunk, offset);
          offset += chunk.length;
        }

        const blob = new Blob([finalZipData], { type: 'application/zip' });
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
