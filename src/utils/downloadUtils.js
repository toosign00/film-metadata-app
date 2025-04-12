import { isMobile } from 'react-device-detect';

// 로그 메세지 출력 여부 설정 true 는 출력, false 는 출력 안함
// **************중요************** 배포 시에는 false로 설정해야 함
const ENABLE_LOGGING = false;

const debug = (message, data) => {
  if (ENABLE_LOGGING) {
    if (data !== undefined) {
      console.log(`[DownloadUtil] ${message}`, data);
    } else {
      console.log(`[DownloadUtil] ${message}`);
    }
  }
};

// 다운로드 상태 관리를 위한 변수
let isUrlRevoked = false;

/**
 * 성능 설정 계산 함수 - 디바이스 환경에 따라 최적 설정 반환
 * @returns {Object} 계산된 성능 설정 객체
 */
const calculatePerformanceSettings = () => {
  // 디바이스 메모리 감지 (기본값 4GB)
  const deviceMemory = navigator.deviceMemory || 4;

  // 모바일 환경 감지
  const isMobileDevice = isMobile;

  // 모바일 환경에 따른 설정 최적화
  const settings = {
    // 배치 크기: 모바일에서는 2-3, 데스크톱에서는 5-10 (메모리에 비례)
    batchSize: isMobileDevice ? Math.max(2, Math.min(3, Math.floor(deviceMemory / 2))) : Math.max(5, Math.min(10, deviceMemory * 2)),

    // 배치 간 지연: 모바일에서는 300-700ms, 데스크톱에서는 50ms
    delayBetweenBatches: isMobileDevice ? 300 + 100 * (4 - Math.min(deviceMemory, 4)) : 50,

    // 청크 크기: 모바일에서는 0.5-1MB, 데스크톱에서는 2-8MB (메모리에 비례)
    chunkSize: isMobileDevice ? Math.max(512 * 1024, deviceMemory * 256 * 1024) : Math.max(2 * 1024 * 1024, deviceMemory * 1024 * 1024),

    // 재시도 횟수: 네트워크 상태에 따라 조정
    maxFetchRetries: isMobileDevice ? 3 : 2,

    // 청크 타임아웃: 모바일에서는 더 긴 타임아웃
    fetchTimeout: isMobileDevice ? 45000 : 30000,
  };

  return settings;
};

/**
 * 단일 파일 다운로드 함수
 * @param {Object} image - 다운로드할 이미지 객체 {url, name}
 */
export const downloadFile = (image) => {
  try {
    if (!image || !image.url) {
      throw new Error('다운로드할 이미지 정보가 없습니다');
    }

    // URL이 이미 해제되었는지 확인
    if (isUrlRevoked) {
      alert('다운로드 URL이 만료되었습니다. 메타데이터 설정부터 다시 진행해주세요.');
      return;
    }

    const a = document.createElement('a');
    a.href = image.url;
    a.download = image.name || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // 메모리 최적화: URL 즉시 해제
    URL.revokeObjectURL(image.url);
    isUrlRevoked = true; // URL이 해제되었음을 표시
  } catch (error) {
    console.error('[DownloadUtil] 파일 다운로드 오류:', error);
    alert(`파일 다운로드 중 오류가 발생했습니다: ${error.message}`);
  }
};

/**
 * 모든 결과 파일 ZIP으로 다운로드
 * @param {Array} resultImages - 다운로드할 이미지 객체 배열
 * @param {Function} setProcessing - 처리 중 상태 설정 함수
 * @param {Function} setZipProgress - 진행률 업데이트 함수
 * @param {Function} setIsZipCompressing - 압축 중 상태 설정 함수
 */
export const downloadAllAsZip = async (resultImages, setProcessing, setZipProgress, setIsZipCompressing) => {
  // 입력 검증
  if (!resultImages || !Array.isArray(resultImages) || resultImages.length === 0) {
    alert('다운로드할 이미지가 없습니다.');
    return;
  }

  // URL이 이미 해제되었는지 확인
  if (isUrlRevoked) {
    alert('다운로드 URL이 만료되었습니다. 메타데이터 설정부터 다시 진행해주세요.');
    return;
  }

  // 유효한 이미지만 필터링
  const validImages = resultImages.filter((img) => img && img.url);
  if (validImages.length === 0) {
    alert('다운로드할 유효한 이미지가 없습니다.');
    return;
  }

  // 상태 업데이트 함수
  const updateProcessing = typeof setProcessing === 'function' ? setProcessing : () => {};
  const updateZipProgress = typeof setZipProgress === 'function' ? setZipProgress : () => {};
  const updateIsZipCompressing = typeof setIsZipCompressing === 'function' ? setIsZipCompressing : () => {};

  // 처리 시작
  updateProcessing(true);
  updateZipProgress(0);
  updateIsZipCompressing(true);

  // 웹 워커 참조
  let worker = null;

  // 성능 설정 계산
  const perfSettings = calculatePerformanceSettings();

  debug(
    `환경 설정: 배치 크기: ${perfSettings.batchSize}, 지연시간: ${perfSettings.delayBetweenBatches}ms, 청크 크기: ${perfSettings.chunkSize}바이트`
  );

  try {
    debug(`${validImages.length}개 이미지 ZIP 압축 시작`);

    // 웹 워커 생성
    worker = new Worker(new URL('../workers/zipWorker.js', import.meta.url), { type: 'module' });

    // 진행 상황 추적
    let processedCount = 0;
    let chunkProcessedCount = 0;
    const totalFiles = validImages.length;
    // 진행률 계산에 사용할 가중치 - 파일 처리: 75%, 압축: 25%
    const FILE_PROCESSING_WEIGHT = 75;
    const COMPRESSION_WEIGHT = 25;

    // 워커 메시지 처리
    worker.onmessage = (event) => {
      const { type, payload } = event.data;
      debug(`워커 메시지: ${type}`);

      switch (type) {
        case 'READY':
          // 이제 파일들을 추가할 수 있음
          processFilesInBatches();
          break;

        case 'FILE_ADDED':
          // 파일 추가 완료 - 청크인지 여부에 따라 다른 카운터 증가
          if (payload.isChunk) {
            // 청크 처리 카운트 증가
            chunkProcessedCount++;
            debug(`청크 처리: ${chunkProcessedCount} (${payload.name})`);
          } else {
            // 실제 파일 완료 카운트 증가
            processedCount++;
            // 안전장치: processedCount가 totalFiles를 초과하지 않도록 제한
            processedCount = Math.min(processedCount, totalFiles);
            debug(`파일 처리 완료: ${processedCount}/${totalFiles} (${payload.name})`);
          }

          // 진행률 계산 - 파일 처리는 전체의 75%까지만
          const fileProgress = Math.min((processedCount / totalFiles) * FILE_PROCESSING_WEIGHT, FILE_PROCESSING_WEIGHT);
          updateZipProgress(Math.round(fileProgress));
          break;

        case 'COMPRESSION_PROGRESS':
          // 압축 진행 상황 (0-100%)
          const compressionPercent = payload.percent || 0;
          // 압축은 전체의 25% 할당
          const compressionProgress = (compressionPercent / 100) * COMPRESSION_WEIGHT;
          // 전체 진행률 = 파일 처리 진행률 + 압축 진행률
          const totalProgress = Math.min(Math.round((processedCount / totalFiles) * FILE_PROCESSING_WEIGHT + compressionProgress), 100);
          updateZipProgress(totalProgress);
          debug(`압축 진행률: ${compressionPercent}%, 전체 진행률: ${totalProgress}%`);
          break;

        case 'COMPLETE':
          // ZIP 압축 완료
          try {
            updateZipProgress(100); // 완료 시 100%로 설정
            finishDownload(payload);
          } catch (error) {
            handleError(`ZIP 다운로드 중 오류: ${error.message}`);
          }
          break;

        case 'ERROR':
          // 오류 발생
          handleError(payload.message);
          break;
      }
    };

    // 오류 이벤트
    worker.onerror = (error) => {
      handleError(`웹 워커 오류: ${error.message || '알 수 없는 오류'}`);
    };

    // 워커 시작
    debug('ZIP 워커 초기화');
    worker.postMessage({ type: 'START_ZIP' });

    /**
     * 배치 단위로 파일 처리
     */
    const processFilesInBatches = async () => {
      const totalBatches = Math.ceil(validImages.length / perfSettings.batchSize);
      debug(`총 ${totalBatches}개의 배치로 처리 시작`);

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const startIdx = batchIndex * perfSettings.batchSize;
        const endIdx = Math.min(startIdx + perfSettings.batchSize, validImages.length);
        const currentBatch = validImages.slice(startIdx, endIdx);

        debug(`배치 ${batchIndex + 1}/${totalBatches} 처리 중 (${currentBatch.length}개 파일)`);

        // 현재 배치의 파일들 처리
        await processBatch(currentBatch);

        // 배치 간 지연 (메모리 압박 감소)
        if (batchIndex < totalBatches - 1) {
          debug(`배치 간 지연 ${perfSettings.delayBetweenBatches}ms`);
          await new Promise((resolve) => setTimeout(resolve, perfSettings.delayBetweenBatches));
        }

        // 5개 배치마다 GC 유도 (메모리 관리)
        if (batchIndex > 0 && batchIndex % 5 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }

      // 모든 배치 처리 완료 후 ZIP 생성 요청
      debug('모든 파일 추가 완료, ZIP 압축 요청');
      worker.postMessage({ type: 'FINISH_ZIP' });
    };

    /**
     * 배치 처리 함수
     * @param {Array} batch - 처리할 이미지 배치
     */
    const processBatch = async (batch) => {
      const batchPromises = [];

      // 병렬 처리로 성능 최적화 (배치 내 모든 파일 동시 처리)
      for (let i = 0; i < batch.length; i++) {
        batchPromises.push(processFile(batch[i], i));
      }

      // 모든 파일 처리 완료 대기
      await Promise.allSettled(batchPromises);
    };

    /**
     * 개별 파일 처리 함수 (청킹 처리 포함)
     * @param {Object} image - 처리할 이미지
     * @param {number} batchIndex - 배치 내 인덱스
     */
    const processFile = async (image, batchIndex) => {
      try {
        // 파일 이름 정의
        const fileName = image.name || `image_${validImages.indexOf(image) + 1}.jpg`;

        // 이미지 데이터 가져오기 - 재시도 메커니즘 추가
        let response;
        let retryCount = 0;

        while (retryCount <= perfSettings.maxFetchRetries) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), perfSettings.fetchTimeout);

            response = await fetch(image.url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (response.ok) break;

            debug(`이미지 가져오기 실패 (시도 ${retryCount + 1}/${perfSettings.maxFetchRetries + 1}): ${fileName} (HTTP ${response.status})`);
            retryCount++;

            if (retryCount <= perfSettings.maxFetchRetries) {
              await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount)); // 점진적 대기
            }
          } catch (fetchError) {
            if (fetchError.name === 'AbortError') {
              debug(`이미지 가져오기 타임아웃 (시도 ${retryCount + 1}/${perfSettings.maxFetchRetries + 1}): ${fileName}`);
            } else {
              debug(`이미지 가져오기 오류 (시도 ${retryCount + 1}/${perfSettings.maxFetchRetries + 1}): ${fetchError.message}`);
            }

            retryCount++;

            if (retryCount <= perfSettings.maxFetchRetries) {
              await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
            } else {
              throw fetchError;
            }
          }
        }

        if (!response || !response.ok) {
          debug(`최대 재시도 후 이미지 가져오기 실패: ${fileName}`);
          return; // 이 파일은 건너뛰고 계속 진행
        }

        // Blob으로 변환
        const blob = await response.blob();

        // 빈 파일 조기 감지
        if (blob.size === 0) {
          debug(`빈 파일 감지: ${fileName} - 처리 스킵`);
          return; // 빈 파일 처리 스킵
        }

        // 파일 크기에 따른 청킹 처리 결정
        if (blob.size > perfSettings.chunkSize) {
          await processLargeFile(blob, fileName);
        } else {
          // 작은 파일은 직접 처리
          const arrayBuffer = await blob.arrayBuffer();

          worker.postMessage(
            {
              type: 'ADD_FILE',
              payload: {
                name: fileName,
                data: arrayBuffer,
              },
            },
            [arrayBuffer] // transferable 객체로 전송
          );
        }

        // 여기서는 아직 URL을 해제하지 않음 (다운로드 완료 후 해제하도록 변경)

        // 배치 내 처리 간격 (작은 지연)
        if (batchIndex > 0 && batchIndex % 2 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      } catch (error) {
        debug(`파일 처리 오류 (${image.name || `이미지`}): ${error.message}`);
        // 한 파일이 실패해도 계속 진행
      }
    };

    /**
     * 큰 파일 청킹 처리 함수
     * @param {Blob} blob - 파일 Blob
     * @param {string} fileName - 파일 이름
     */
    const processLargeFile = async (blob, fileName) => {
      const totalSize = blob.size;
      let processedSize = 0;
      let chunkIndex = 0;

      // 동적 청크 크기 조정 - 파일 크기에 따라 조정
      const adjustedChunkSize =
        totalSize > 100 * 1024 * 1024
          ? perfSettings.chunkSize / 2 // 매우 큰 파일은 더 작은 청크 사용
          : perfSettings.chunkSize;

      debug(`큰 파일 청킹 처리: ${fileName} (${totalSize} 바이트, 조정된 청크 크기: ${adjustedChunkSize} 바이트)`);

      // 총 청크 수 미리 계산
      const totalChunks = Math.ceil(totalSize / adjustedChunkSize);

      while (processedSize < totalSize) {
        const end = Math.min(processedSize + adjustedChunkSize, totalSize);
        const chunk = blob.slice(processedSize, end);
        const chunkBuffer = await chunk.arrayBuffer();

        // 청크 추가
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

        // 성능 최적화: 청크 처리 중 GC 유도
        if (chunkIndex % 5 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 20));
        } else {
          await new Promise((resolve) => setTimeout(resolve, 5));
        }
      }

      // 메모리 관리: 참조 해제
      blob = null;
    };

    /**
     * ZIP 압축 완료 후 다운로드
     * @param {Object} payload - 완료 페이로드
     */
    const finishDownload = (payload) => {
      const { zipData, fileCount } = payload;

      debug(`ZIP 생성 완료: ${fileCount || 0}개 파일, ${zipData?.byteLength || 0} 바이트`);
      updateZipProgress(100);

      if (!zipData || !zipData.byteLength) {
        throw new Error('생성된 ZIP 데이터가 없습니다');
      }

      // ZIP Blob 생성 및 다운로드
      const blob = new Blob([zipData], { type: 'application/zip' });
      downloadZipFile(blob, fileCount || validImages.length);

      // 리소스 정리
      cleanup();
    };

    /**
     * 오류 처리
     * @param {string} message - 오류 메시지
     */
    const handleError = (message) => {
      debug(`오류 발생: ${message}`);
      alert(`ZIP 파일 생성 중 오류가 발생했습니다: ${message}`);
      cleanup();
    };

    /**
     * 리소스 정리
     */
    const cleanup = () => {
      // 워커 종료
      if (worker) {
        try {
          worker.terminate();
        } catch (e) {
          // 무시
        }
        worker = null;
      }

      // 상태 업데이트
      updateProcessing(false);
      updateIsZipCompressing(false);

      // 메모리 정리 개선
      for (let i = 0; i < validImages.length; i++) {
        try {
          if (validImages[i] && validImages[i].url) {
            URL.revokeObjectURL(validImages[i].url);
          }
        } catch (e) {
          // 무시
        }
      }

      // URL 해제 상태 설정
      isUrlRevoked = true;
    };
  } catch (error) {
    debug('ZIP 압축 중 오류:', error);
    alert(`ZIP 파일 생성 중 오류가 발생했습니다: ${error.message}`);

    // 리소스 정리
    if (worker) {
      try {
        worker.terminate();
      } catch (e) {
        // 무시
      }
    }

    updateProcessing(false);
    updateZipProgress(0);
    updateIsZipCompressing(false);
  }
};

/**
 * ZIP 파일 다운로드 헬퍼 함수
 * @param {Blob} blob - ZIP 데이터 Blob
 * @param {number} fileCount - 파일 개수
 */
const downloadZipFile = (blob, fileCount) => {
  try {
    // 파일명 생성
    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const zipFileName = `film_metadata_${timestamp}.zip`;

    // 다운로드 링크 생성
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = zipFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // 메모리 정리 - URL 즉시 해제
    setTimeout(() => {
      URL.revokeObjectURL(url);
      blob = null;
    }, 100);

    // URL 해제 상태 설정
    isUrlRevoked = true;

    alert(`${fileCount}개 파일이 성공적으로 ZIP으로 압축되었습니다.`);
  } catch (error) {
    console.error('[DownloadUtil] ZIP 파일 다운로드 오류:', error);
    alert(`ZIP 파일 다운로드 중 오류가 발생했습니다: ${error.message}`);
  }
};

/**
 * URL 해제 상태 초기화 함수 - 메타데이터 설정이 다시 될 때 호출
 */
export const resetUrlRevokedState = () => {
  isUrlRevoked = false;
  debug('URL 해제 상태가 초기화되었습니다.');
};
