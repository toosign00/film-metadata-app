'use client';

import { Download } from 'lucide-react';
import { ErrorDisplay } from '@/components/layout/ErrorDisplay';
import { StepIntro } from '@/components/layout/StepIntro';
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
    <section ref={resultRef} aria-labelledby='results-section'>
      <StepIntro
        eyebrow='03 / EXPORT'
        title='결과를 확인하세요'
        titleId='results-section'
        description={<p>사진을 개별로 받거나 성공한 결과를 ZIP 파일로 내려받을 수 있어요.</p>}
      />

      <div className='mb-6 flex flex-col gap-3 border-y border-border py-4 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-sm text-foreground-secondary'>
          {resultImages.length}장의 이미지가 준비됐어요
        </p>
        {resultImages.length > 0 && (
          <Button
            onClick={handleDownloadAll}
            disabled={processing}
            isLoading={processing && zipProgress > 0}
            className='whitespace-nowrap'
            icon={processing ? null : <Download aria-hidden='true' className='h-4 w-4' />}
          >
            ZIP 다운로드
          </Button>
        )}
      </div>

      {processing && <ProgressBar progress={zipProgress} label='ZIP 파일 생성 중' />}

      <ErrorDisplay errors={errors} />

      {resultImages.length > 0 ? (
        <>
          <div className='grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'>
            {resultImages.map((image) => (
              <ImageCard
                key={`${image.name}-${image.url}`}
                image={image}
                onDownload={downloadFile}
                processing={processing}
              />
            ))}
          </div>
          <div className='mt-8'>
            <Button variant='text' onClick={() => goToStep(2)} disabled={processing}>
              ← 메타데이터 설정
            </Button>
          </div>
        </>
      ) : (
        <div className='rounded-2xl border border-border bg-surface p-6 text-center'>
          <h2 className='text-base font-semibold text-foreground'>처리된 이미지가 없어요</h2>
          <p className='mt-2 text-sm text-foreground-muted'>
            촬영 정보를 확인한 뒤 다시 적용해 주세요.
          </p>
          <Button
            variant='secondary'
            onClick={() => goToStep(2)}
            disabled={processing}
            className='mt-5'
          >
            메타데이터 설정으로 돌아가기
          </Button>
        </div>
      )}
    </section>
  );
};
