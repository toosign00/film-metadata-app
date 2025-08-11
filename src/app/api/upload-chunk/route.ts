import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { writeFile, mkdir } from 'node:fs/promises';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 청크 상태를 추적하는 메모리 저장소
const chunkStatus = new Map<string, Set<number>>();

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const fileId = formData.get('fileId') as string;
    const chunkIndex = parseInt(formData.get('chunkIndex') as string);
    const totalChunks = parseInt(formData.get('totalChunks') as string);
    const chunk = formData.get('chunk') as File;

    if (!fileId || Number.isNaN(chunkIndex) || Number.isNaN(totalChunks) || !chunk) {
      return new Response(JSON.stringify({ error: 'Invalid request data' }), {
        status: 400,
        headers: { 'content-type': 'application/json; charset=utf-8' },
      });
    }

    // 임시 디렉토리 생성
    const tempDir = join(tmpdir(), 'chunk-uploads', fileId);
    await mkdir(tempDir, { recursive: true });

    // 청크 파일 저장
    const chunkPath = join(tempDir, `chunk_${chunkIndex.toString().padStart(6, '0')}`);
    const chunkBuffer = await chunk.arrayBuffer();
    await writeFile(chunkPath, Buffer.from(chunkBuffer));

    // 청크 상태 업데이트
    if (!chunkStatus.has(fileId)) {
      chunkStatus.set(fileId, new Set());
    }
    chunkStatus.get(fileId)?.add(chunkIndex);

    // 모든 청크 수신 완료 확인
    const receivedChunks = chunkStatus.get(fileId)?.size || 0;

    return new Response(
      JSON.stringify({
        success: true,
        receivedChunks,
        totalChunks,
        isComplete: receivedChunks === totalChunks,
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json; charset=utf-8' },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return new Response(JSON.stringify({ error: 'Missing fileId' }), {
        status: 400,
        headers: { 'content-type': 'application/json; charset=utf-8' },
      });
    }

    const chunks = chunkStatus.get(fileId);
    if (!chunks) {
      return new Response(
        JSON.stringify({
          uploadedChunks: 0,
          totalChunks: 0,
          isComplete: false,
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json; charset=utf-8' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        uploadedChunks: chunks.size,
        totalChunks: chunks.size, // 실제로는 totalChunks를 별도로 저장해야 함
        isComplete: false,
      }),
      {
        status: 200,
        headers: { 'content-type': 'application/json; charset=utf-8' },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }
}
