import { del } from '@vercel/blob';
import type { BlobDeleteResponse } from '@/types/api.types';
import {
  createErrorResponse,
  createSuccessResponse,
  handleApiError,
  isVercelBlobUrl,
} from '@/utils/apiUtils';

export const runtime = 'nodejs';

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const urls = searchParams.get('urls');

    // URL 파라미터 파싱
    let urlsToDelete: string[] = [];
    if (url) {
      urlsToDelete = [url];
    } else if (urls) {
      try {
        urlsToDelete = JSON.parse(urls);
      } catch {
        return createErrorResponse('Invalid URLs format', 400);
      }
    } else {
      return createErrorResponse('No URLs provided', 400);
    }

    // Vercel Blob URL 검증
    const validUrls = urlsToDelete.filter(isVercelBlobUrl);

    if (validUrls.length === 0) {
      return createErrorResponse('No valid Vercel Blob URLs provided', 400);
    }

    // Blob 삭제 실행
    await del(validUrls);

    const response: BlobDeleteResponse = {
      success: true,
      deletedCount: validUrls.length,
      message: `${validUrls.length} blob(s) deleted successfully`,
    };

    return createSuccessResponse(response);
  } catch (error) {
    return handleApiError(error, 'Blob deletion failed');
  }
}
