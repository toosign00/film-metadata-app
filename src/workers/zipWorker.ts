import { Zip, ZipPassThrough } from 'fflate';

// Worker 타입 선언
declare const self: Worker;

// 로그 메세지 출력 여부 설정 true 는 출력, false 는 출력 안함
// **************중요************** 배포 시에는 false로 설정해야 함
const ENABLE_LOGGING = false;

interface WorkerMessage {
  type: 'START_ZIP' | 'ADD_FILE_CHUNK' | 'FINISH_ZIP';
  payload?: FileChunkPayload;
}

interface FileChunkPayload {
  name: string;
  data: ArrayBuffer;
  isLast: boolean;
  totalSize: number;
  currentPosition: number;
}

interface WorkerResponse {
  type: 'READY' | 'ZIP_DATA' | 'ERROR' | 'FILE_ADDED' | 'COMPRESSION_PROGRESS';
  payload: {
    data?: ArrayBuffer;
    final?: boolean;
    message?: string;
    name?: string;
    size?: number;
    percent?: number;
  };
}

/**
 * 로그 출력 함수
 * @param message - 로그 메시지
 * @param data - 추가 데이터(선택적)
 */
const log = (message: string, data?: unknown): void => {
  if (ENABLE_LOGGING) {
    if (data !== undefined) {
      console.log(`[ZipWorker] ${message}`, data);
    } else {
      console.log(`[ZipWorker] ${message}`);
    }
  }
};

let zipInstance: Zip | null = null;
const fileStreams = new Map<string, ZipPassThrough>();

// 파일 저장소
const files: Record<string, unknown> = {};
let fileCount = 0;

// 파일 청크 저장소
const fileChunks: Record<string, unknown> = {};

/**
 * 워커 메시지 처리
 */
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  try {
    const { type, payload } = event.data;
    log(`메시지 수신: ${type}`);

    switch (type) {
      case 'START_ZIP':
        handleStartZip();
        break;
      case 'ADD_FILE_CHUNK':
        if (payload) {
          await handleFileChunk(payload);
        }
        break;
      case 'FINISH_ZIP':
        handleFinishZip();
        break;
      default:
        throw new Error(`알 수 없는 메시지 타입: ${type}`);
    }
  } catch (error) {
    log(`메시지 처리 중 오류: ${error instanceof Error ? error.message : String(error)}`);
    self.postMessage({
      type: 'ERROR',
      payload: { message: error instanceof Error ? error.message : String(error) },
    } as WorkerResponse);
  }
};

function handleStartZip(): void {
  try {
    zipInstance = new Zip((err: Error | null, data: Uint8Array, final: boolean) => {
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
        } as WorkerResponse,
        [data.buffer]
      );
    });

    self.postMessage({ type: 'READY', payload: {} } as WorkerResponse);
  } catch (error) {
    log(`ZIP 초기화 중 오류: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

async function handleFileChunk(payload: FileChunkPayload): Promise<void> {
  try {
    if (!zipInstance) {
      throw new Error('ZIP 스트림이 초기화되지 않았습니다');
    }

    const { name, data, isLast, totalSize, currentPosition } = payload;

    if (!fileStreams.has(name)) {
      const streamingFile = new ZipPassThrough(name);
      zipInstance.add(streamingFile);
      fileStreams.set(name, streamingFile);
      log(`새로운 파일 스트림 생성: ${name}`);
    }

    const streamingFile = fileStreams.get(name);
    if (!streamingFile) {
      throw new Error(`파일 스트림을 찾을 수 없습니다: ${name}`);
    }

    const chunk = new Uint8Array(data);
    streamingFile.push(chunk, isLast);
    log(`청크 처리됨: ${name} (${chunk.length} 바이트, 마지막: ${isLast})`);

    if (isLast) {
      fileStreams.delete(name);
      self.postMessage({
        type: 'FILE_ADDED',
        payload: { name, size: totalSize },
      } as WorkerResponse);
      log(`파일 처리 완료: ${name}`);
    }

    // 진행률 업데이트
    const progress = Math.min(Math.round(((currentPosition + chunk.length) / totalSize) * 100), 100);
    self.postMessage({
      type: 'COMPRESSION_PROGRESS',
      payload: { percent: progress },
    } as WorkerResponse);
  } catch (error) {
    log(`청크 처리 중 오류: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

function handleFinishZip(): void {
  try {
    if (!zipInstance) {
      throw new Error('ZIP 스트림이 초기화되지 않았습니다');
    }

    if (fileStreams.size > 0) {
      const remainingFiles = Array.from(fileStreams.keys()).join(', ');
      throw new Error(`처리되지 않은 파일이 있습니다: ${remainingFiles}`);
    }

    log('ZIP 생성 완료');
    zipInstance.end();
  } catch (error) {
    log(`ZIP 종료 중 오류: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}
