import { Zip, ZipPassThrough } from 'fflate';

// 로그 메세지 출력 여부 설정 true 는 출력, false 는 출력 안함
// **************중요************** 배포 시에는 false로 설정해야 함
const ENABLE_LOGGING = false;

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

let zip = null;
const fileStreams = new Map();

// 파일 저장소
const files = {};
let fileCount = 0;

// 파일 청크 저장소
const fileChunks = {};

/**
 * 워커 메시지 처리
 */
self.onmessage = async (event) => {
  try {
    const { type, payload } = event.data;
    log(`메시지 수신: ${type}`);

    switch (type) {
      case 'START_ZIP':
        handleStartZip();
        break;
      case 'ADD_FILE_CHUNK':
        await handleFileChunk(payload);
        break;
      case 'FINISH_ZIP':
        handleFinishZip();
        break;
      default:
        throw new Error(`알 수 없는 메시지 타입: ${type}`);
    }
  } catch (error) {
    log(`메시지 처리 중 오류: ${error.message}`);
    self.postMessage({
      type: 'ERROR',
      payload: { message: error.message },
    });
  }
};

function handleStartZip() {
  try {
    zip = new Zip((err, data, final) => {
      if (err) {
        throw new Error(`ZIP 스트림 처리 중 오류: ${err.message}`);
      }

      self.postMessage(
        {
          type: 'ZIP_DATA',
          payload: {
            data: data.buffer,
            final,
          },
        },
        [data.buffer]
      );
    });

    self.postMessage({ type: 'READY' });
  } catch (error) {
    log(`ZIP 초기화 중 오류: ${error.message}`);
    throw error;
  }
}

async function handleFileChunk(payload) {
  try {
    if (!zip) {
      throw new Error('ZIP 스트림이 초기화되지 않았습니다');
    }

    const { name, data, isLast, totalSize, currentPosition } = payload;

    if (!fileStreams.has(name)) {
      const streamingFile = new ZipPassThrough(name);
      zip.add(streamingFile);
      fileStreams.set(name, streamingFile);
      log(`새로운 파일 스트림 생성: ${name}`);
    }

    const streamingFile = fileStreams.get(name);
    const chunk = new Uint8Array(data);

    streamingFile.push(chunk, isLast);
    log(`청크 처리됨: ${name} (${chunk.length} 바이트, 마지막: ${isLast})`);

    if (isLast) {
      fileStreams.delete(name);
      self.postMessage({
        type: 'FILE_ADDED',
        payload: { name, size: totalSize },
      });
      log(`파일 처리 완료: ${name}`);
    }

    // 진행률 업데이트
    const progress = Math.min(Math.round(((currentPosition + chunk.length) / totalSize) * 100), 100);
    self.postMessage({
      type: 'COMPRESSION_PROGRESS',
      payload: { percent: progress },
    });
  } catch (error) {
    log(`청크 처리 중 오류: ${error.message}`);
    throw error;
  }
}

function handleFinishZip() {
  try {
    if (!zip) {
      throw new Error('ZIP 스트림이 초기화되지 않았습니다');
    }

    if (fileStreams.size > 0) {
      const remainingFiles = Array.from(fileStreams.keys()).join(', ');
      throw new Error(`처리되지 않은 파일이 있습니다: ${remainingFiles}`);
    }

    log('ZIP 생성 완료');
    zip.end();
  } catch (error) {
    log(`ZIP 종료 중 오류: ${error.message}`);
    throw error;
  }
}
