import { zip } from 'fflate';

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

// 파일 저장소
const files = {};
let fileCount = 0;

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
        for (const key in files) {
          delete files[key];
        }
        fileCount = 0;
        self.postMessage({ type: 'READY' });
        break;

      case 'ADD_FILE':
        handleAddFile(payload);
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
    self.postMessage({ type: 'FILE_ADDED', payload: { name } });
  } catch (error) {
    log(`파일 추가 중 오류: ${error.message}`);
    self.postMessage({
      type: 'ERROR',
      payload: { message: `파일 추가 중 오류 (${payload?.name || 'unknown'}): ${error.message}` },
    });
  }
}

/**
 * ZIP 파일 생성 완료 처리
 */
function handleFinishZip() {
  try {
    // 파일 존재 확인
    if (fileCount === 0 || Object.keys(files).length === 0) {
      throw new Error('압축할 파일이 없습니다. 재다운로드를 진행하시려면 메타데이터 설정을 다시 진행 해주세요.');
    }

    log(`ZIP 생성 시작 (${fileCount}개 파일)`);

    // fflate의 zip 함수로 압축 수행
    zip(files, { level: 6 }, (err, data) => {
      if (err) {
        self.postMessage({
          type: 'ERROR',
          payload: { message: `ZIP 압축 중 오류: ${err.message}` },
        });
        return;
      }

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
      for (const key in files) {
        delete files[key];
      }
      fileCount = 0;
    });
  } catch (error) {
    log(`ZIP 완료 중 오류: ${error.message}`);
    self.postMessage({
      type: 'ERROR',
      payload: { message: `ZIP 완료 중 오류: ${error.message}` },
    });
  }
}
