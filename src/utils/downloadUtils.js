// 디버깅 로그 함수 - 필요시 false로 변경
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

/**
 * 단일 파일 다운로드 함수
 * @param {Object} image - 다운로드할 이미지 객체 {url, name}
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

  try {
    debug(`${validImages.length}개 이미지 ZIP 압축 시작`);

    // 웹 워커 생성
    worker = new Worker(new URL('../workers/zipWorker.js', import.meta.url), { type: 'module' });

    // 진행 상황 추적
    let processedCount = 0;
    const totalFiles = validImages.length;

    // 워커 메시지 처리
    worker.onmessage = (event) => {
      const { type, payload } = event.data;
      debug(`워커 메시지: ${type}`);

      switch (type) {
        case 'READY':
          // 이제 파일들을 추가할 수 있음
          processFiles();
          break;

        case 'FILE_ADDED':
          // 파일 추가 완료
          processedCount++;
          const progress = Math.round((processedCount / totalFiles) * 95); // 95%까지 (최종 압축은 5% 배정)
          updateZipProgress(progress);
          debug(`진행 상황: ${processedCount}/${totalFiles} (${progress}%)`);
          break;

        case 'COMPLETE':
          // ZIP 압축 완료
          try {
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

    // 이미지 파일들 처리
    const processFiles = async () => {
      for (let i = 0; i < validImages.length; i++) {
        const image = validImages[i];

        try {
          // 파일 이름 정의
          const fileName = image.name || `image_${i + 1}.jpg`;

          // 이미지 데이터 가져오기
          const response = await fetch(image.url);
          if (!response.ok) {
            debug(`이미지 가져오기 실패: ${fileName} (HTTP ${response.status})`);
            continue; // 이 파일은 건너뛰고 계속 진행
          }

          // Blob으로 변환 후 ArrayBuffer로 변환
          const blob = await response.blob();
          const arrayBuffer = await blob.arrayBuffer();

          // 워커로 전송
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

          // 사용 완료된 URL 해제
          URL.revokeObjectURL(image.url);
        } catch (error) {
          debug(`파일 처리 오류 (${image.name || `이미지 ${i}`}): ${error.message}`);
          // 한 파일이 실패해도 계속 진행
        }

        // 브라우저가 응답할 기회를 주기 위한 짧은 지연
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      // 모든 파일 처리 완료 후 ZIP 생성 요청
      debug('모든 파일 추가 완료, ZIP 압축 요청');
      worker.postMessage({ type: 'FINISH_ZIP' });
    };

    // ZIP 압축 완료 후 다운로드
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

    // 오류 처리
    const handleError = (message) => {
      debug(`오류 발생: ${message}`);
      alert(`ZIP 파일 생성 중 오류가 발생했습니다: ${message}`);
      cleanup();
    };

    // 리소스 정리
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

    // 메모리 정리
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);

    alert(`${fileCount}개 파일이 성공적으로 ZIP으로 압축되었습니다.`);
  } catch (error) {
    console.error('[DownloadUtil] ZIP 파일 다운로드 오류:', error);
    alert(`ZIP 파일 다운로드 중 오류가 발생했습니다: ${error.message}`);
  }
};
