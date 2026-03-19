'use client';

import { Download, Image } from 'lucide-react';
import { ErrorDisplay } from '@/components/layout/ErrorDisplay';
import { Button } from '@/components/ui/Button';
import { ImageCard } from '@/components/ui/ImageCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { downloadFile } from '@/services/download/singleFileDownload';
import { createZipFile } from '@/services/download/zipDownload';
import type { ResultsViewerProps } from '@/types/resultsViewer.types';

export const ResultsViewer = ({
  activeStep,
  resultRef,
  resultImages,
  errors,
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
    setProcessing(true);
    setZipProgress(1);

    try {
      await createZipFile(resultImages, setZipProgress, setProcessing, setProcessing);
    } catch (error) {
      console.error('ZIP 다운로드 중 오류:', error);
      setProcessing(false);
      setZipProgress(0);
    }
  };

  return (
    <section ref={resultRef} className='mb-8 transition-all' aria-labelledby='results-section'>
      <div className='rounded-xl border border-border bg-surface p-5 shadow-md md:p-6'>
        <div className='mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center sm:gap-0'>
          <h2 id='results-section' className='flex items-center font-bold text-foreground text-xl'>
            <span className='mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground'>
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

        {processing && <ProgressBar progress={zipProgress} label='ZIP 파일 생성 중' />}

        <ErrorDisplay errors={errors} />

        {resultImages.length > 0 ? (
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4'>
            {resultImages.map((image) => (
              <ImageCard
                key={image.name}
                image={image}
                onDownload={downloadFile}
                processing={processing}
              />
            ))}
          </div>
        ) : (
          <div className='rounded-lg border border-border bg-surface-alt p-8 text-center shadow-md'>
            <Image className='mx-auto mb-3 text-foreground-muted' size={48} />
            <p className='text-foreground-secondary'>처리된 이미지가 여기에 표시됩니다.</p>
            <p className='mt-2 text-foreground-muted text-sm'>
              메타데이터를 설정하기 위해 2단계로 이동하세요.
            </p>
            <button
              type='button'
              onClick={() => goToStep(2)}
              disabled={processing}
              className={`mt-4 rounded-lg px-4 py-2 font-medium text-sm transition ${
                processing
                  ? 'cursor-not-allowed bg-surface text-foreground-muted'
                  : 'bg-muted text-foreground-secondary hover:bg-border-hover'
              }`}
            >
              메타데이터 설정으로 이동
            </button>
          </div>
        )}

        <div className='mt-6'>
          <Button variant='text' onClick={() => goToStep(2)} disabled={processing}>
            &larr; 이전 단계로
          </Button>
        </div>
      </div>
    </section>
  );
};
