import { readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { Zip, ZipPassThrough } from 'fflate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { fileId } = await req.json();

    if (!fileId) {
      return new Response(JSON.stringify({ error: 'Missing fileId' }), {
        status: 400,
        headers: { 'content-type': 'application/json; charset=utf-8' },
      });
    }

    const tempDir = join(tmpdir(), 'chunk-uploads', fileId);

    // 청크 파일들 읽기
    const files = await readdir(tempDir);
    const chunkFiles = files
      .filter((file) => file.startsWith('chunk_'))
      .sort((a, b) => {
        const aIndex = parseInt(a.split('_')[1]);
        const bIndex = parseInt(b.split('_')[1]);
        return aIndex - bIndex;
      });

    if (chunkFiles.length === 0) {
      return new Response(JSON.stringify({ error: 'No chunks found' }), {
        status: 400,
        headers: { 'content-type': 'application/json; charset=utf-8' },
      });
    }

    // 청크들을 순서대로 병합
    const mergedPath = join(tempDir, 'merged');
    const mergedChunks: Buffer[] = [];

    for (const chunkFile of chunkFiles) {
      const chunkPath = join(tempDir, chunkFile);
      const chunkData = await readFile(chunkPath);
      mergedChunks.push(chunkData);
    }

    // 병합된 파일 저장
    const mergedBuffer = Buffer.concat(mergedChunks);
    await writeFile(mergedPath, mergedBuffer);

    // ZIP 생성
    const zipFileName = `file_${fileId}.zip`;
    const zipPath = join(tempDir, zipFileName);

    await createZipFile(mergedPath, zipFileName, zipPath);

    // ZIP 파일을 클라이언트로 전송
    const zipBuffer = await readFile(zipPath);

    // 임시 파일들 정리
    try {
      await rm(tempDir, { recursive: true });
    } catch (error) {
      console.warn('Failed to cleanup temp files:', error);
    }

    const headers = new Headers();
    headers.set('content-type', 'application/zip');
    headers.set('content-disposition', `attachment; filename="${zipFileName}"`);

    return new Response(zipBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }
}

/**
 * 단일 파일을 ZIP으로 압축합니다.
 */
async function createZipFile(filePath: string, fileName: string, zipPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const zip = new Zip((err, data, final) => {
      if (err) {
        reject(err);
        return;
      }

      if (data) {
        // ZIP 데이터를 파일에 쓰기
        writeFile(zipPath, Buffer.from(data), { flag: 'a' }).catch(reject);
      }

      if (final) {
        resolve();
      }
    });

    const entry = new ZipPassThrough(fileName);
    zip.add(entry);

    // 파일을 청크로 읽어서 ZIP에 추가
    readFile(filePath)
      .then((fileData) => {
        entry.push(new Uint8Array(fileData), true);
        zip.end();
      })
      .catch(reject);
  });
}
