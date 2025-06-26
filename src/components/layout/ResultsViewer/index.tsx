import { ImageCard } from '@/components/ui/ImageCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { downloadFile, createZipFile } from '@/utils/downloadUtils';
import { ResultsViewerProps } from '@/types/results-viewer.type';

export const ResultsViewer = ({
  activeStep,
  resultRef,
  resultImages,
  processing,
  zipProgress,
  setZipProgress,
  setProcessing,
  goToStep,
}: ResultsViewerProps) => {
  if (activeStep !== 3) {
    return null;
  }

  const handleDownloadAll = async () => {
    try {
      setProcessing(true);
      await createZipFile(resultImages, setZipProgress, setProcessing, setProcessing);
    } catch (error) {
      console.error('ZIP 다운로드 중 오류:', error);
      setProcessing(false);
    }
  };

  return (
    <section ref={resultRef} className="mb-8 transition-all" aria-labelledby="results-section">
      <div className="rounded-xl border border-gray-700 bg-gray-800 p-5 shadow-md md:p-6">
        <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0">
          <h2 id="results-section" className="flex items-center text-xl font-bold text-gray-200">
            <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-sm text-white">
              3
            </span>
            {resultImages.length > 0 ? `처리 결과 (${resultImages.length}개 파일)` : '처리 결과'}
          </h2>
          {resultImages.length > 0 && (
            <Button
              variant="primary"
              onClick={handleDownloadAll}
              disabled={processing}
              isLoading={processing && zipProgress > 0}
              icon={
                !processing ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mr-1.5 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                ) : null
              }
              className="flex h-10 w-full items-center justify-center sm:w-auto"
            >
              {processing && zipProgress > 0 ? (
                `${zipProgress}%`
              ) : (
                <>
                  <span className="inline">ZIP 다운로드</span>
                </>
              )}
            </Button>
          )}
        </div>

        {/* 압축 진행 상태 표시 */}
        {processing && zipProgress > 0 && (
          <ProgressBar progress={zipProgress} label="ZIP 파일 생성 중" />
        )}

        {resultImages.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {resultImages.map((image, idx) => (
              <ImageCard key={idx} image={image} onDownload={downloadFile} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-700 bg-gray-900 p-8 text-center shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto mb-3 h-12 w-12 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-300">처리된 이미지가 여기에 표시됩니다.</p>
            <p className="mt-2 text-sm text-gray-500">
              메타데이터를 설정하기 위해 2단계로 이동하세요.
            </p>
            <button
              onClick={() => goToStep(2)}
              className="mt-4 rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-600"
            >
              메타데이터 설정으로 이동
            </button>
          </div>
        )}

        {/* 이전 단계로 버튼 */}
        <div className="mt-6">
          <Button variant="text" onClick={() => goToStep(2)}>
            &larr; 이전 단계로
          </Button>
        </div>
      </div>
    </section>
  );
};
