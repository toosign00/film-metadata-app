import { Zip, ZipPassThrough } from 'fflate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ProgressEntry = {
  processed: number;
  total: number;
  done: boolean;
  error?: string;
};

const progressStore = new Map<string, ProgressEntry>();

type ZipInputFile = {
  url: string;
  name: string;
};

type ParsedRequest = {
  urlFiles: ZipInputFile[];
  uploadFiles: File[];
  requestId?: string;
};

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

export async function POST(req: Request) {
  try {
    const { urlFiles, uploadFiles, requestId } = await parseRequest(req);

    if ((!urlFiles || urlFiles.length === 0) && uploadFiles.length === 0) {
      return new Response(JSON.stringify({ error: 'No files provided' }), {
        status: 400,
        headers: { 'content-type': 'application/json; charset=utf-8' },
      });
    }

    const now = new Date();
    const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate()
    ).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(
      now.getMinutes()
    ).padStart(2, '0')}`;
    const zipFileName = `film_metadata_${timestamp}.zip`;

    const id =
      requestId ??
      globalThis.crypto?.randomUUID?.() ??
      `${Date.now()}_${Math.random().toString(36).slice(2)}`;

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
          if (data) {
            const source = data as Uint8Array;
            const safe = new Uint8Array(source.byteLength);
            safe.set(source);
            controller.enqueue(safe);
          }
          if (final) {
            const entry = progressStore.get(id);
            if (entry) progressStore.set(id, { ...entry, done: true });
            setTimeout(() => progressStore.delete(id), 5 * 60 * 1000);
            controller.close();
          }
        });

        // Process files sequentially to minimize memory usage
        (async () => {
          // Prefer uploaded files when present
          if (uploadFiles.length > 0) {
            for (const file of uploadFiles) {
              const entry = new ZipPassThrough((file as File).name || 'file');
              zip.add(entry);
              try {
                // Use arrayBuffer() for stability across runtimes
                const buf = await (file as File).arrayBuffer();
                entry.push(new Uint8Array(buf), true);
                const prog = progressStore.get(id);
                if (prog)
                  progressStore.set(id, {
                    ...prog,
                    processed: Math.min(prog.processed + 1, prog.total),
                  });
              } catch (e) {
                const err = e instanceof Error ? e : new Error(String(e));
                const prog = progressStore.get(id);
                if (prog) progressStore.set(id, { ...prog, error: err.message, done: true });
                controller.error(err);
                return;
              }
            }
          } else {
            // Fallback: fetch from provided URLs (only http/https supported)
            for (const file of urlFiles) {
              const entry = new ZipPassThrough(file.name || 'file');
              zip.add(entry);
              try {
                const u = new URL(file.url);
                if (u.protocol !== 'http:' && u.protocol !== 'https:') {
                  throw new Error(`Unsupported URL scheme: ${u.protocol}`);
                }
                const res = await fetch(file.url, { cache: 'no-store' });
                if (!res.ok || !res.body) {
                  throw new Error(`Failed to fetch ${file.url}`);
                }
                const reader = res.body.getReader();
                while (true) {
                  const { value, done } = await reader.read();
                  if (done) break;
                  if (value) entry.push(value);
                }
                entry.push(new Uint8Array(0), true);
                const prog = progressStore.get(id);
                if (prog)
                  progressStore.set(id, {
                    ...prog,
                    processed: Math.min(prog.processed + 1, prog.total),
                  });
              } catch (e) {
                const err = e instanceof Error ? e : new Error(String(e));
                const prog = progressStore.get(id);
                if (prog) progressStore.set(id, { ...prog, error: err.message, done: true });
                controller.error(err);
                return;
              }
            }
          }
          zip.end();
        })().catch((e) => controller.error(e));
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
    // Prevent caching
    headers.set('cache-control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    headers.set('pragma', 'no-cache');
    headers.set('expires', '0');

    return new Response(stream, { status: 200, headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing id' }), {
      status: 400,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
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
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}
