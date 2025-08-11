import { Zip } from 'fflate';
import type { ZipInputFile, ZipProgressEntry } from '@/types/api.types';
import { createErrorResponse, handleApiError } from '@/utils/apiUtils';
import {
  addFileToZip,
  addUploadedFileToZip,
  generateRequestId,
  generateZipFileName,
} from '@/utils/zipUtils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const progressStore = new Map<string, ZipProgressEntry>();

interface ParsedRequest {
  urlFiles: ZipInputFile[];
  uploadFiles: File[];
  requestId?: string;
}

async function parseRequest(req: Request): Promise<ParsedRequest> {
  const contentType = req.headers.get('content-type') || '';
  // JSON body
  if (contentType.includes('application/json')) {
    const body = (await req.json()) as
      | { files?: ZipInputFile[]; requestId?: string }
      | ZipInputFile[];
    const files = Array.isArray(body)
      ? (body as ZipInputFile[])
      : (body as { files?: ZipInputFile[] })?.files;
    const requestId = Array.isArray(body) ? undefined : (body as { requestId?: string }).requestId;
    return { urlFiles: Array.isArray(files) ? files : [], uploadFiles: [], requestId };
  }

  // Form submissions: handle both URL list and uploaded File(s)
  if (
    contentType.includes('multipart/form-data') ||
    contentType.includes('application/x-www-form-urlencoded')
  ) {
    const formData = await req.formData();

    // 1) Parse textual URL list (JSON in 'files' or 'payload')
    let urlFiles: ZipInputFile[] = [];
    const payload = formData.get('files') || formData.get('payload');
    if (typeof payload === 'string') {
      try {
        const parsed = JSON.parse(payload);
        if (Array.isArray(parsed)) urlFiles = parsed as ZipInputFile[];
        else if (parsed && Array.isArray(parsed.files)) urlFiles = parsed.files as ZipInputFile[];
      } catch (_) {
        // ignore invalid payload
      }
    }

    // 2) Collect uploaded File(s)
    const candidates: unknown[] = [...formData.getAll('files'), ...formData.getAll('file')];
    const uploadFiles = candidates.filter(
      (v): v is File => typeof v !== 'string' && v instanceof File
    );

    // 3) Optional requestId
    const rid = formData.get('requestId');
    const requestId = typeof rid === 'string' ? rid : undefined;

    return { urlFiles, uploadFiles, requestId };
  }

  return { urlFiles: [], uploadFiles: [], requestId: undefined };
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, OPTIONS',
      'access-control-allow-headers': 'Content-Type',
    },
  });
}

export async function POST(req: Request) {
  try {
    const { urlFiles, uploadFiles, requestId } = await parseRequest(req);

    if ((!urlFiles || urlFiles.length === 0) && uploadFiles.length === 0) {
      return createErrorResponse('No files provided');
    }

    const zipFileName = generateZipFileName();
    const id = requestId ?? generateRequestId();
    const totalFiles = (urlFiles?.length ?? 0) + (uploadFiles?.length ?? 0);

    progressStore.set(id, { processed: 0, total: totalFiles, done: false });

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const zip = new Zip((err, data, final) => {
          if (err) {
            const entry = progressStore.get(id);
            if (entry) progressStore.set(id, { ...entry, error: err.message, done: true });
            controller.error(err);
            return;
          }
          // Ensure ArrayBuffer-backed chunk (avoid SharedArrayBuffer typing issue)
          if (data && data.byteLength > 0) {
            try {
              const source = data as Uint8Array;
              // Check if ArrayBuffer is detached before creating a new one
              if (source.buffer.byteLength === 0) {
                console.warn('Skipping detached ArrayBuffer');
                return;
              }
              const safe = new Uint8Array(source);
              controller.enqueue(safe);
            } catch (error) {
              console.error('Error processing ZIP data chunk:', error);
              // Continue processing other chunks instead of failing completely
            }
          }
          if (final) {
            const entry = progressStore.get(id);
            if (entry) progressStore.set(id, { ...entry, done: true });
            setTimeout(() => progressStore.delete(id), 5 * 60 * 1000);
            controller.close();
          }
        });

        // Process files sequentially to minimize memory usage
        const processFiles = async () => {
          try {
            // Prefer uploaded files when present
            if (uploadFiles.length > 0) {
              for (const file of uploadFiles) {
                await addUploadedFileToZip(zip, file as File, progressStore, id);
              }
            } else {
              // Fallback: fetch from provided URLs (only http/https supported)
              for (const file of urlFiles) {
                await addFileToZip(zip, file, progressStore, id);
              }
            }
            zip.end();
          } catch (error) {
            controller.error(error);
          }
        };

        processFiles().catch((error) => {
          console.error('Error processing files:', error);
          controller.error(error);
        });
      },
      type: 'bytes',
    });

    const headers = new Headers();
    headers.set('content-type', 'application/zip');
    headers.set(
      'content-disposition',
      `attachment; filename="${zipFileName}"; filename*=UTF-8''${encodeURIComponent(zipFileName)}`
    );
    headers.set('x-request-id', id);
    // Prevent caching and improve browser compatibility
    headers.set('cache-control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    headers.set('pragma', 'no-cache');
    headers.set('expires', '0');
    headers.set('access-control-allow-origin', '*');
    headers.set('access-control-allow-methods', 'GET, POST, OPTIONS');
    headers.set('access-control-allow-headers', 'Content-Type');

    return new Response(stream, { status: 200, headers });
  } catch (error) {
    return handleApiError(error, 'ZIP creation failed');
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return createErrorResponse('Missing id parameter');
  }

  const entry = progressStore.get(id);
  if (!entry) {
    // 아직 엔트리가 생성되지 않은 초기 상태: 204 No Content로 응답해 클라이언트에서 대기하도록 유도
    return new Response(null, {
      status: 204,
      headers: { 'cache-control': 'no-store' },
    });
  }

  return new Response(JSON.stringify(entry), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}
