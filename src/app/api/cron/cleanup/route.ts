import { del, list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// 매시간 실행되어 tmp/ 경로의 2시간 이상 지난 Blob을 정리
export async function GET(request: Request) {
  try {
    const now = Date.now();
    const { searchParams } = new URL(request.url);
    const cutoffParam = searchParams.get('cutoffMs');
    const dryRunParam = searchParams.get('dryRun');
    const cutoffMs =
      Number.isFinite(Number(cutoffParam)) && Number(cutoffParam) > 0
        ? Number(cutoffParam)
        : 2 * 60 * 60 * 1000; // 기본 2시간
    const dryRun = dryRunParam === '1' || dryRunParam === 'true';

    // tmp/ 프리픽스 하위 항목만 조회
    const { blobs } = await list({ prefix: 'tmp/' });

    const expired = blobs.filter((b) => {
      // 1) uploadedAt 우선 사용
      let created = b.uploadedAt ? new Date(b.uploadedAt as unknown as string).getTime() : NaN;

      // 2) 업로드 키 규칙: tmp/YYYY-MM-DD/<timestamp>_safeName 에서 timestamp 또는 날짜 폴더를 파싱
      if (!Number.isFinite(created)) {
        try {
          const pathname = new URL(b.url).pathname;
          const parts = pathname.split('/');
          const last = parts[parts.length - 1] || '';
          const tsPrefix = last.split('_')[0];
          const tsNumber = Number(tsPrefix);
          if (Number.isFinite(tsNumber)) {
            created = tsNumber;
          } else {
            const dateSeg = parts[parts.length - 2] || '';
            const dateMs = Date.parse(dateSeg);
            if (Number.isFinite(dateMs)) created = dateMs;
          }
        } catch (_) {
          console.error('Failed to parse blob pathname:', b.url);
        }
      }

      if (!Number.isFinite(created)) return false;
      return now - created >= cutoffMs;
    });

    let deleted = 0;
    if (!dryRun && expired.length > 0) {
      await del(expired.map((b) => b.url));
      deleted = expired.length;
    }

    return NextResponse.json({ success: true, deleted, matched: expired.length, cutoffMs, dryRun });
  } catch (error) {
    console.error('Cron cleanup error:', error);
    return NextResponse.json({ success: false, error: 'cleanup failed' }, { status: 500 });
  }
}
