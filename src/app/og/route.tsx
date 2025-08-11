import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') || 'Film Metadata Settings App';

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        color: '#e2e8f0',
      }}
    >
      <div style={{ fontSize: 64, fontWeight: 800 }}>{title}</div>
      <div style={{ marginTop: 16, fontSize: 28 }}>필름 EXIF 메타데이터 편집 웹 도구</div>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  );
}
