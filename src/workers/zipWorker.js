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
        // 초기화 (cleanupResources 호출 삭제)
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

// cleanupResources 함수 삭제

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

    for (let i = 0; i < fileInfo.chunks.length; i++) {
      const chunk = fileInfo.chunks[i];
      combinedData.set(chunk, offset);
      offset += chunk.length;
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
  } catch (error) {
    log(`청크 결합 중 오류: ${error.message}`);
    throw error; // 상위 함수에서 처리
  }
}

function handleFinishZip() {
  try {
    // 남은 청크 처리 시도 (기존 코드 유지)
    for (const originalName in fileChunks) {
      try {
        if (fileChunks[originalName].receivedChunks === fileChunks[originalName].totalChunks) {
          combineChunks(originalName);
        } else {
          log(`불완전한 청크 세트 무시: ${originalName}`);
        }
      } catch (error) {
        log(`남은 청크 처리 중 오류 (${originalName}): ${error.message}`);
      }
    }

    // 파일 존재 확인
    if (Object.keys(files).length === 0) {
      throw new Error('압축할 파일이 없습니다.');
    }

    // 실제 ZIP에 포함된 파일 수 계산
    const actualFileCount = Object.keys(files).length;

    // 총 데이터 크기 계산
    const totalSize = Object.values(files).reduce((sum, file) => sum + file.length, 0);

    // 압축 레벨 설정
    const compressionLevel = totalSize > 50 * 1024 * 1024 ? 3 : 6;

    log(`ZIP 생성 시작 (${actualFileCount}개 파일, 총 ${totalSize} 바이트)`);

    // 압축 시작 알림
    self.postMessage({
      type: 'COMPRESSION_PROGRESS',
      payload: { percent: 0 },
    });

    // ZIP 압축
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
      log(`ZIP 생성 완료: ${data.length} 바이트, 파일 수: ${actualFileCount}`);
      self.postMessage(
        {
          type: 'COMPLETE',
          payload: {
            zipData: data.buffer,
            fileCount: actualFileCount, // 변경된 부분
          },
        },
        [data.buffer]
      );
    });
  } catch (error) {
    log(`ZIP 완료 중 오류: ${error.message}`);
    self.postMessage({
      type: 'ERROR',
      payload: { message: `ZIP 완료 중 오류: ${error.message}` },
    });
  }
}
