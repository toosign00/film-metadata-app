import { isMobile } from 'react-device-detect';

// 로그 메세지 출력 여부 설정
const ENABLE_LOGGING = true;

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
 * 성능 설정 계산 함수 - 디바이스 환경에 따라 최적 설정 반환
 */
const calculatePerformanceSettings = () => {
  const deviceMemory = navigator.deviceMemory || 4;
  const isMobileDevice = isMobile;

  return {
    batchSize: isMobileDevice ? Math.max(2, Math.min(3, Math.floor(deviceMemory / 2))) : Math.max(5, Math.min(10, deviceMemory * 2)),
    delayBetweenBatches: isMobileDevice ? 300 + 100 * (4 - Math.min(deviceMemory, 4)) : 50,
    chunkSize: isMobileDevice ? Math.max(512 * 1024, deviceMemory * 256 * 1024) : Math.max(2 * 1024 * 1024, deviceMemory * 1024 * 1024),
    maxFetchRetries: isMobileDevice ? 3 : 2,
    fetchTimeout: isMobileDevice ? 45000 : 30000,
  };
};

/**
 * 단일 파일 다운로드 함수
 */
export const downloadFile = (image) => {
  try {
    if (!image || !image.url) {
      throw new Error('다운로드할 이미지 정보가 없습니다');
    }

    const a = document.createElement('a');
    a.href = image.url;
    a.download = image.name || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    console.error('[DownloadUtil] 파일 다운로드 오류:', error);
    alert(`파일 다운로드 중 오류가 발생했습니다: ${error.message}`);
  }
};

/**
 * 모든 결과 파일 ZIP으로 다운로드
 */
export const downloadAllAsZip = async (resultImages, setProcessing, setZipProgress, setIsZipCompressing) => {
  if (!resultImages || !Array.isArray(resultImages) || resultImages.length === 0) {
    alert('다운로드할 이미지가 없습니다.');
    return;
  }

  const validImages = resultImages.filter((img) => img && img.url);
  if (validImages.length === 0) {
    alert('다운로드할 유효한 이미지가 없습니다.');
    return;
  }

  const updateProcessing = typeof setProcessing === 'function' ? setProcessing : () => {};
  const updateZipProgress = typeof setZipProgress === 'function' ? setZipProgress : () => {};
  const updateIsZipCompressing = typeof setIsZipCompressing === 'function' ? setIsZipCompressing : () => {};

  updateProcessing(true);
  updateZipProgress(0);
  updateIsZipCompressing(true);

  let worker = null;
  const perfSettings = calculatePerformanceSettings();

  try {
    worker = new Worker(new URL('../workers/zipWorker.js', import.meta.url), { type: 'module' });

    let processedCount = 0;
    let chunkProcessedCount = 0;
    const totalFiles = validImages.length;
    const FILE_PROCESSING_WEIGHT = 75;
    const COMPRESSION_WEIGHT = 25;

    worker.onmessage = (event) => {
      const { type, payload } = event.data;

      switch (type) {
        case 'READY':
          processFilesInBatches();
          break;

        case 'FILE_ADDED':
          if (payload.isChunk) {
            chunkProcessedCount++;
          } else {
            processedCount = Math.min(processedCount + 1, totalFiles);
          }
          const fileProgress = Math.min((processedCount / totalFiles) * FILE_PROCESSING_WEIGHT, FILE_PROCESSING_WEIGHT);
          updateZipProgress(Math.round(fileProgress));
          break;

        case 'COMPRESSION_PROGRESS':
          const compressionPercent = payload.percent || 0;
          const compressionProgress = (compressionPercent / 100) * COMPRESSION_WEIGHT;
          const totalProgress = Math.min(Math.round((processedCount / totalFiles) * FILE_PROCESSING_WEIGHT + compressionProgress), 100);
          updateZipProgress(totalProgress);
          break;

        case 'COMPLETE':
          try {
            updateZipProgress(100);
            finishDownload(payload);
          } catch (error) {
            handleError(`ZIP 다운로드 중 오류: ${error.message}`);
          }
          break;

        case 'ERROR':
          handleError(payload.message);
          break;
      }
    };

    worker.onerror = (error) => {
      handleError(`웹 워커 오류: ${error.message || '알 수 없는 오류'}`);
    };

    worker.postMessage({ type: 'START_ZIP' });

    const processFilesInBatches = async () => {
      const totalBatches = Math.ceil(validImages.length / perfSettings.batchSize);

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const startIdx = batchIndex * perfSettings.batchSize;
        const endIdx = Math.min(startIdx + perfSettings.batchSize, validImages.length);
        const currentBatch = validImages.slice(startIdx, endIdx);

        await processBatch(currentBatch);

        if (batchIndex < totalBatches - 1) {
          await new Promise((resolve) => setTimeout(resolve, perfSettings.delayBetweenBatches));
        }

        if (batchIndex > 0 && batchIndex % 5 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }

      worker.postMessage({ type: 'FINISH_ZIP' });
    };

    const processBatch = async (batch) => {
      const batchPromises = batch.map((image, i) => processFile(image, i));
      await Promise.allSettled(batchPromises);
    };

    const processFile = async (image, batchIndex) => {
      try {
        const fileName = image.name || `image_${validImages.indexOf(image) + 1}.jpg`;
        let response;
        let retryCount = 0;

        while (retryCount <= perfSettings.maxFetchRetries) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), perfSettings.fetchTimeout);

            response = await fetch(image.url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (response.ok) break;

            retryCount++;

            if (retryCount <= perfSettings.maxFetchRetries) {
              await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
            }
          } catch (fetchError) {
            retryCount++;

            if (retryCount <= perfSettings.maxFetchRetries) {
              await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
            } else {
              throw fetchError;
            }
          }
        }

        if (!response || !response.ok) {
          return;
        }

        const blob = await response.blob();

        if (blob.size === 0) {
          return;
        }

        if (blob.size > perfSettings.chunkSize) {
          await processLargeFile(blob, fileName);
        } else {
          const arrayBuffer = await blob.arrayBuffer();
          worker.postMessage(
            {
              type: 'ADD_FILE',
              payload: {
                name: fileName,
                data: arrayBuffer,
              },
            },
            [arrayBuffer]
          );
        }

        if (batchIndex > 0 && batchIndex % 2 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      } catch (error) {
        debug(`파일 처리 오류 (${image.name || `이미지`}): ${error.message}`);
      }
    };

    const processLargeFile = async (blob, fileName) => {
      const totalSize = blob.size;
      let processedSize = 0;
      let chunkIndex = 0;

      const adjustedChunkSize = totalSize > 100 * 1024 * 1024 ? perfSettings.chunkSize / 2 : perfSettings.chunkSize;
      const totalChunks = Math.ceil(totalSize / adjustedChunkSize);

      while (processedSize < totalSize) {
        const end = Math.min(processedSize + adjustedChunkSize, totalSize);
        const chunk = blob.slice(processedSize, end);
        const chunkBuffer = await chunk.arrayBuffer();

        worker.postMessage(
          {
            type: 'ADD_FILE_CHUNK',
            payload: {
              name: `${fileName}.part${chunkIndex}`,
              originalName: fileName,
              data: chunkBuffer,
              isLastChunk: end >= totalSize,
              chunkIndex: chunkIndex,
              totalChunks: totalChunks,
            },
          },
          [chunkBuffer]
        );

        processedSize = end;
        chunkIndex++;

        if (chunkIndex % 5 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 20));
        } else {
          await new Promise((resolve) => setTimeout(resolve, 5));
        }
      }
    };

    const finishDownload = (payload) => {
      const { zipData, fileCount } = payload;

      if (!zipData || !zipData.byteLength) {
        throw new Error('생성된 ZIP 데이터가 없습니다');
      }

      const blob = new Blob([zipData], { type: 'application/zip' });
      downloadZipFile(blob, fileCount || validImages.length);

      updateProcessing(false);
      updateIsZipCompressing(false);
    };

    const handleError = (message) => {
      alert(`ZIP 파일 생성 중 오류가 발생했습니다: ${message}`);

      if (worker) {
        try {
          worker.terminate();
        } catch (e) {}
        worker = null;
      }

      updateProcessing(false);
      updateIsZipCompressing(false);
    };
  } catch (error) {
    alert(`ZIP 파일 생성 중 오류가 발생했습니다: ${error.message}`);

    if (worker) {
      try {
        worker.terminate();
      } catch (e) {}
    }

    updateProcessing(false);
    updateZipProgress(0);
    updateIsZipCompressing(false);
  }
};

const downloadZipFile = (blob, fileCount) => {
  try {
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const zipFileName = `film_metadata_${timestamp}.zip`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = zipFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    alert(`${fileCount}개 파일이 성공적으로 ZIP으로 압축되었습니다.`);
  } catch (error) {
    console.error('[DownloadUtil] ZIP 파일 다운로드 오류:', error);
    alert(`ZIP 파일 다운로드 중 오류가 발생했습니다: ${error.message}`);
  }
};
