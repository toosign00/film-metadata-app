import { Download, Image } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ImageCard } from '@/components/ui/ImageCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { ResultsViewerProps } from '@/types/results-viewer.type';
import { createZipFile, downloadFile } from '@/utils/downloadUtils';

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
    <section ref={resultRef} className='mb-8 transition-all' aria-labelledby='results-section'>
      <div className='rounded-xl border border-gray-700 bg-gray-800 p-5 shadow-md md:p-6'>
        <div className='mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0'>
          <h2 id='results-section' className='flex items-center text-xl font-bold text-gray-200'>
            <span className='mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-sm text-white'>
              3
            </span>
            {resultImages.length > 0 ? `처리 결과 (${resultImages.length}개 파일)` : '처리 결과'}
          </h2>
          {resultImages.length > 0 && (
            <Button
              variant='primary'
              onClick={handleDownloadAll}
              disabled={processing}
              isLoading={processing && zipProgress > 0}
              icon={!processing ? <Download className='mr-1.5 h-5 w-5' /> : null}
              className='flex h-10 w-full items-center justify-center sm:w-auto'
            >
              {processing && zipProgress > 0 ? (
                `${zipProgress}%`
              ) : (
                <span className='inline'>ZIP 다운로드</span>
              )}
            </Button>
          )}
        </div>

        {/* 압축 진행 상태 표시 */}
        {processing && zipProgress > 0 && (
          <ProgressBar progress={zipProgress} label='ZIP 파일 생성 중' />
        )}

        {resultImages.length > 0 ? (
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4'>
            {resultImages.map((image, idx) => (
              <ImageCard key={`${image.name}-${idx}`} image={image} onDownload={downloadFile} />
            ))}
          </div>
        ) : (
          <div className='rounded-lg border border-gray-700 bg-gray-900 p-8 text-center shadow-md'>
            <Image className='mx-auto mb-3 text-gray-500' size={48} />
            <p className='text-gray-300'>처리된 이미지가 여기에 표시됩니다.</p>
            <p className='mt-2 text-sm text-gray-500'>
              메타데이터를 설정하기 위해 2단계로 이동하세요.
            </p>
            <button
              type='button'
              onClick={() => goToStep(2)}
              className='mt-4 rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-600'
            >
              메타데이터 설정으로 이동
            </button>
          </div>
        )}

        {/* 이전 단계로 버튼 */}
        <div className='mt-6'>
          <Button variant='text' onClick={() => goToStep(2)}>
            &larr; 이전 단계로
          </Button>
        </div>
      </div>
    </section>
  );
};
