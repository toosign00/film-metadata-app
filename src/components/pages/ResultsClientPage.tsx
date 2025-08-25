'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { ResultsViewer } from '@/components/layout/ResultsViewer';
import { StepNavigation } from '@/components/layout/StepNavigation';
import { useStepStore } from '@/store/stepStore';

export function ResultsClientPage() {
  const router = useRouter();
  const resultRef = useRef<HTMLElement>(null);
  const { files, resultImages, processing, zipProgress, setZipProgress, setProcessing, resetAll } =
    useStepStore(
      useShallow((s) => ({
        files: s.files,
        resultImages: s.resultImages,
        processing: s.processing,
        zipProgress: s.zipProgress,
        setZipProgress: s.setZipProgress,
        setProcessing: s.setProcessing,
        resetAll: s.resetAll,
      }))
    );

  useEffect(() => {
    if (files.length === 0) {
      router.replace('/');
    }
  }, [files.length, router]);

  // 3단계에서 새로고침 시 결과/진행 상태가 사라질 수 있어 브라우저 확인 창을 띄웁니다.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasProgress = files.length > 0 || resultImages.length > 0 || processing;
    if (!hasProgress) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [files.length, resultImages.length, processing]);

  const goToStep = (step: number) => {
    if (step === 2) router.push('/metadata');
    if (step === 1) router.push('/');
  };

  return (
    <>
      <StepNavigation
        activeStep={3}
        goToStep={goToStep}
        filesCount={files.length}
        resultsCount={resultImages.length}
        resetForm={resetAll}
        processing={processing}
      />
      <section className='flex-1 overflow-auto'>
        <div className='mx-auto w-full max-w-6xl'>
          <ResultsViewer
            activeStep={3}
            resultRef={resultRef}
            resultImages={resultImages}
            processing={processing}
            zipProgress={zipProgress}
            setZipProgress={setZipProgress}
            setProcessing={setProcessing}
            goToStep={goToStep}
          />
        </div>
      </section>
    </>
  );
}
