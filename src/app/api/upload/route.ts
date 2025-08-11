import { type HandleUploadBody, handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/jpeg', 'image/jpg', 'application/octet-stream'],
        maximumSizeInBytes: 25 * 1024 * 1024, // 25MB
        addRandomSuffix: true,
      }),
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log('Upload completed:', { url: blob.url, tokenPayload });
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 400 }
    );
  }
}
