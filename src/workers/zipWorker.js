import { zip } from 'fflate';

// 로그 메세지 출력 여부 설정 true 는 출력, false 는 출력 안함
// **************중요************** 배포 시에는 false로 설정해야 함
const ENABLE_LOGGING = true;

/**
 * 로그 출력 함수
 * @param {string} message - 로그 메시지
 * @param {any} data - 추가 데이터(선택적)
 */
const log = (message, data) => {
  if (ENABLE_LOGGING) {
    if (data !== undefined) {
      console.log(`[ZipWorker] ${message}`, data);
    } else {
      console.log(`[ZipWorker] ${message}`);
    }
  }
};

// 파일 저장소
const files = {};
let fileCount = 0;

// 파일 청크 저장소
const fileChunks = {};

/**
 * 워커 메시지 처리
 */
self.onmessage = (event) => {
  try {
    const { type, payload } = event.data;
    log(`메시지 수신: ${type}`);
    switch (type) {
      case 'START_ZIP':
        // 초기화
        cleanupResources();
        self.postMessage({ type: 'READY' });
        break;
      case 'ADD_FILE':
        handleAddFile(payload);
        break;
      case 'ADD_FILE_CHUNK':
        handleAddFileChunk(payload);
        break;
      case 'FINISH_ZIP':
        handleFinishZip();
        break;
    }
  } catch (error) {
    log(`메시지 처리 중 오류: ${error.message}`);
    self.postMessage({
      type: 'ERROR',
      payload: { message: `메시지 처리 중 오류: ${error.message}` },
    });
  }
};

/**
 * 리소스 정리 함수
 */
function cleanupResources() {
  // 모든 파일 데이터 정리
  for (const key in files) {
    files[key] = null;
    delete files[key];
  }

  // 모든 청크 데이터 정리
  for (const key in fileChunks) {
    if (fileChunks[key] && fileChunks[key].chunks) {
      // 각 청크 배열 참조 해제
      for (let i = 0; i < fileChunks[key].chunks.length; i++) {
        fileChunks[key].chunks[i] = null;
      }
      fileChunks[key].chunks = null;
    }
    delete fileChunks[key];
  }

  fileCount = 0;

  // GC 힌트
  if (typeof self.gc === 'function') {
    try {
      self.gc();
    } catch (e) {
      // GC 호출 실패는 무시
    }
  }
}

/**
 * 파일 추가 처리
 * @param {Object} payload - 파일 데이터 객체 {name, data}
 */
function handleAddFile(payload) {
  try {
    // 기본 검증
    if (!payload || !payload.name || !payload.data) {
      throw new Error('유효하지 않은 파일 정보');
    }
    const { name, data } = payload;

    // ArrayBuffer를 Uint8Array로 안전하게 변환
    let fileData;
    if (data instanceof Uint8Array) {
      fileData = data;
    } else if (data instanceof ArrayBuffer) {
      fileData = new Uint8Array(data);
    } else {
      throw new Error(`지원되지 않는 데이터 형식: ${typeof data}`);
    }

    // 빈 파일 처리
    if (fileData.length === 0) {
      log(`주의: 빈 파일 - ${name}`);
      // 빈 파일에 대해 1바이트 더미 데이터 사용
      fileData = new Uint8Array(1);
    }

    // 파일 컬렉션에 추가
    files[name] = fileData;
    fileCount++;

    log(`파일 추가됨: ${name} (${fileData.length} 바이트)`);

    // 청크가 아닌 실제 파일임을 표시
    self.postMessage({
      type: 'FILE_ADDED',
      payload: {
        name,
        isChunk: false,
      },
    });

    // 메모리 관리: 참조 변수 해제
    fileData = null;
  } catch (error) {
    log(`파일 추가 중 오류: ${error.message}`);
    self.postMessage({
      type: 'ERROR',
      payload: { message: `파일 추가 중 오류 (${payload?.name || 'unknown'}): ${error.message}` },
    });
  }
}

/**
 * 파일 청크 추가 처리
 * @param {Object} payload - 청크 데이터 객체
 */
function handleAddFileChunk(payload) {
  try {
    // 기본 검증
    if (
      !payload ||
      !payload.name ||
      !payload.originalName ||
      !payload.data ||
      payload.chunkIndex === undefined ||
      payload.totalChunks === undefined
    ) {
      throw new Error('유효하지 않은 청크 정보');
    }

    const { name, originalName, data, isLastChunk, chunkIndex, totalChunks } = payload;

    // ArrayBuffer를 Uint8Array로 안전하게 변환
    let chunkData;
    if (data instanceof Uint8Array) {
      chunkData = data;
    } else if (data instanceof ArrayBuffer) {
      chunkData = new Uint8Array(data);
    } else {
      throw new Error(`지원되지 않는 데이터 형식: ${typeof data}`);
    }

    // 빈 청크 처리
    if (chunkData.length === 0) {
      log(`주의: 빈 청크 - ${name}`);
      // 빈 파일에 대해 1바이트 더미 데이터 사용
      chunkData = new Uint8Array(1);
    }

    // 파일의 청크 정보 초기화 (처음 청크가 도착한 경우)
    if (!fileChunks[originalName]) {
      fileChunks[originalName] = {
        chunks: Array(totalChunks).fill(null),
        receivedChunks: 0,
        totalChunks: totalChunks,
      };
    }

    // 청크 저장
    fileChunks[originalName].chunks[chunkIndex] = chunkData;
    fileChunks[originalName].receivedChunks++;

    log(`청크 추가됨: ${name} (${chunkData.length} 바이트) - [${chunkIndex + 1}/${totalChunks}]`);

    // 청크 처리 진행 상황 알림 (청크임을 명시)
    self.postMessage({
      type: 'FILE_ADDED',
      payload: {
        name: originalName,
        isChunk: true,
        chunkIndex: chunkIndex,
        totalChunks: totalChunks,
      },
    });

    // 메모리 관리: 참조 변수 해제
    chunkData = null;

    // 마지막 청크이거나 모든 청크를 받았으면 파일 결합
    if (isLastChunk || fileChunks[originalName].receivedChunks === totalChunks) {
      combineChunks(originalName);
    }
  } catch (error) {
    log(`청크 추가 중 오류: ${error.message}`);
    self.postMessage({
      type: 'ERROR',
      payload: { message: `청크 추가 중 오류 (${payload?.originalName || 'unknown'}): ${error.message}` },
    });
  }
}

/**
 * 청크 결합 함수
 * @param {string} originalName - 원본 파일 이름
 */
function combineChunks(originalName) {
  try {
    const fileInfo = fileChunks[originalName];
    if (!fileInfo || !fileInfo.chunks || fileInfo.chunks.some((chunk) => chunk === null)) {
      throw new Error(`불완전한 청크 (${fileInfo?.receivedChunks || 0}/${fileInfo?.totalChunks || '?'})`);
    }

    // 전체 크기 계산
    const totalSize = fileInfo.chunks.reduce((acc, chunk) => acc + chunk.length, 0);

    // 새 배열 생성 및 청크 데이터 복사
    const combinedData = new Uint8Array(totalSize);
    let offset = 0;

    // 메모리 최적화: 복사 즉시 해제
    for (let i = 0; i < fileInfo.chunks.length; i++) {
      const chunk = fileInfo.chunks[i];
      combinedData.set(chunk, offset);
      offset += chunk.length;

      // 복사 후 즉시 청크 메모리 해제
      fileInfo.chunks[i] = null;
    }

    // 결합된 파일 저장
    files[originalName] = combinedData;
    fileCount++;

    log(`청크 결합 완료: ${originalName} (${combinedData.length} 바이트)`);

    // 파일이 완성되었음을 알림 (청크가 아닌 실제 파일)
    self.postMessage({
      type: 'FILE_ADDED',
      payload: {
        name: originalName,
        isChunk: false,
      },
    });

    // 메모리에서 청크 정리
    delete fileChunks[originalName];

    // 메모리 관리: 청크 배열 메모리 해제
    fileInfo.chunks = null;
  } catch (error) {
    log(`청크 결합 중 오류: ${error.message}`);
    throw error; // 상위 함수에서 처리
  }
}

/**
 * ZIP 파일 생성 완료 처리
 */
function handleFinishZip() {
  try {
    // 남은 청크 처리 시도
    for (const originalName in fileChunks) {
      try {
        if (fileChunks[originalName].receivedChunks === fileChunks[originalName].totalChunks) {
          combineChunks(originalName);
        } else {
          log(`불완전한 청크 세트 무시: ${originalName} (${fileChunks[originalName].receivedChunks}/${fileChunks[originalName].totalChunks})`);
        }
      } catch (error) {
        log(`남은 청크 처리 중 오류 (${originalName}): ${error.message}`);
        // 개별 파일 오류는 무시하고 계속 진행
      }
    }

    // 파일 존재 확인
    if (fileCount === 0 || Object.keys(files).length === 0) {
      throw new Error('압축할 파일이 없습니다. 재다운로드를 진행하시려면 메타데이터 설정을 다시 진행 해주세요.');
    }

    // 총 데이터 크기 계산
    const totalSize = Object.values(files).reduce((sum, file) => sum + file.length, 0);

    // 적응적 압축 레벨 설정: 파일 크기가 크면 압축률보다 속도 우선
    const compressionLevel = totalSize > 50 * 1024 * 1024 ? 3 : 6;

    log(`ZIP 생성 시작 (${fileCount}개 파일, 총 ${totalSize} 바이트, 압축 레벨: ${compressionLevel})`);

    // 압축 시작 알림
    self.postMessage({
      type: 'COMPRESSION_PROGRESS',
      payload: { percent: 0 },
    });

    // fflate의 zip 함수로 압축 수행
    zip(files, { level: compressionLevel }, (err, data) => {
      if (err) {
        self.postMessage({
          type: 'ERROR',
          payload: { message: `ZIP 압축 중 오류: ${err.message}` },
        });
        return;
      }

      // 압축 완료 알림
      self.postMessage({
        type: 'COMPRESSION_PROGRESS',
        payload: { percent: 100 },
      });

      // 압축 데이터 전송
      log(`ZIP 생성 완료: ${data.length} 바이트`);
      self.postMessage(
        {
          type: 'COMPLETE',
          payload: {
            zipData: data.buffer,
            fileCount,
          },
        },
        [data.buffer] // Transferable 객체로 전송 (성능 최적화)
      );

      // 메모리 정리
      cleanupResources();
    });
  } catch (error) {
    log(`ZIP 완료 중 오류: ${error.message}`);
    self.postMessage({
      type: 'ERROR',
      payload: { message: `ZIP 완료 중 오류: ${error.message}` },
    });
  }
}
