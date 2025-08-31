/**
 * @module services/download/streamingProcessor
 * 스트림 처리 관련 기능들
 */

import { Zip, ZipPassThrough } from 'fflate';

/**
 * 파일을 청크 단위로 읽는 ReadableStream 생성
 */
export function createFileStream(file: File, chunkSize = 64 * 1024): ReadableStream<Uint8Array> {
  let offset = 0;

  return new ReadableStream({
    async pull(controller) {
      if (offset >= file.size) {
        controller.close();
        return;
      }

      const slice = file.slice(offset, offset + chunkSize);
      const buffer = await slice.arrayBuffer();
      const chunk = new Uint8Array(buffer);

      controller.enqueue(chunk);
      offset += chunkSize;
    },

    cancel() {
      offset = file.size; // 취소 시 스트림 종료
    },
  });
}

/**
 * ZIP 생성을 위한 스트리밍 처리 클래스
 */
export class StreamingZipProcessor {
  private zip: Zip;
  private controller: ReadableStreamDefaultController<Uint8Array> | null = null;
  private isFinished = false;

  constructor() {
    this.zip = new Zip((err, data, final) => {
      if (err) {
        this.controller?.error(err);
        return;
      }

      if (data && data.byteLength > 0 && this.controller) {
        this.controller.enqueue(new Uint8Array(data));
      }

      if (final && !this.isFinished) {
        this.isFinished = true;
        this.controller?.close();
      }
    });
  }

  /**
   * ZIP 스트림 생성
   */
  createStream(): ReadableStream<Uint8Array> {
    return new ReadableStream({
      start: (controller) => {
        this.controller = controller;
      },

      cancel: () => {
        this.cleanup();
      },
    });
  }

  /**
   * 파일을 ZIP에 추가
   */
  async addFile(file: File, name: string): Promise<void> {
    if (this.isFinished) return;

    const entry = new ZipPassThrough(name);
    this.zip.add(entry);

    const fileStream = createFileStream(file);
    const reader = fileStream.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        entry.push(value);

        // 백프레셔 처리: 다음 프레임에서 계속
        await new Promise((resolve) => setTimeout(resolve, 0));
      }

      entry.push(new Uint8Array(0), true); // 파일 완료 신호
    } catch (error) {
      console.error('[StreamingZip] 파일 추가 실패:', name, error);
      entry.push(new Uint8Array(0), true); // 에러 시에도 완료 신호
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * ZIP 생성 완료
   */
  finish(): void {
    if (!this.isFinished) {
      this.zip.end();
    }
  }

  /**
   * 리소스 정리
   */
  private cleanup(): void {
    this.isFinished = true;
    this.controller = null;
  }
}