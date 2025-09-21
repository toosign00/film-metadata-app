'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { MetadataSettingsForm } from '@/components/layout/MetadataSettings';
import { StepNavigation } from '@/components/layout/StepNavigation';
import { useStepStore } from '@/store/stepStore';
import type { MetadataSettings } from '@/types/metadata.type';

export function MetadataClientPage() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const {
    files,
    sortedFiles,
    settings,
    processing,
    completed,
    setSettings,
    processFiles,
    resetAll,
    resultImages,
  } = useStepStore(
    useShallow((s) => ({
      files: s.files,
      sortedFiles: s.sortedFiles,
      settings: s.settings,
      processing: s.processing,
      completed: s.completed,
      setSettings: s.setSettings,
      processFiles: s.processFiles,
      resetAll: s.resetAll,
      resultImages: s.resultImages,
    }))
  );

  useEffect(() => {
    if (files.length === 0) {
      router.replace('/');
    }
  }, [files.length, router]);

  // 2단계에서 작업 중 새로고침 시 진행 중인 설정이 사라질 수 있어 브라우저 확인 창을 띄웁니다.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (files.length === 0) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [files.length]);

  const goToStep = (step: number) => {
    if (step === 1) router.push('/');
    if (step === 3) router.push('/results');
  };

  const onSettingsChange = (name: string, value: string | Date) => {
    setSettings((prev) => ({ ...prev, [name]: value }) as MetadataSettings);
  };

  const onProcessFiles = async () => {
    const results = await processFiles();
    if (results.images.length > 0) router.push('/results');
  };

  return (
    <>
      <StepNavigation
        activeStep={2}
        goToStep={goToStep}
        filesCount={files.length}
        resultsCount={resultImages.length}
        resetForm={resetAll}
      />
      <section className='flex-1 overflow-auto'>
        <div className='mx-auto w-full max-w-6xl'>
          <MetadataSettingsForm
            activeStep={2}
            settings={settings}
            onSettingsChange={onSettingsChange}
            sortedFiles={sortedFiles}
            processing={processing}
            completed={completed}
            formRef={formRef}
            goToStep={goToStep}
            onProcessFiles={onProcessFiles}
          />
        </div>
      </section>
    </>
  );
}
