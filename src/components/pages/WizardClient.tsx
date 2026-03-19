'use client';

import { useEffect, useRef } from 'react';
import { FileSelection } from '@/components/layout/FileSelection';
import { MetadataSettingsForm } from '@/components/layout/MetadataSettings';
import { ResultsViewer } from '@/components/layout/ResultsViewer';
import { StepNavigation } from '@/components/layout/StepNavigation';
import { useAppReducer } from '@/hooks/useAppReducer';
import type { MetadataSettings } from '@/types/metadata.types';

export function WizardClient() {
  const {
    state,
    setFiles,
    setSettings,
    goToStep,
    setZipProgress,
    setProcessing,
    resetAll,
    processFiles,
  } = useAppReducer();

  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (state.files.length === 0) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.files.length]);

  const handleFileSelect = (files: File[]) => setFiles(files);

  const handleSettingsChange = (name: string, value: string | Date) => {
    setSettings((prev) => ({ ...prev, [name]: value }) as MetadataSettings);
  };

  const handleProcessFiles = async () => {
    const results = await processFiles();
    if (results.images.length > 0) goToStep(3);
  };

  return (
    <>
      <StepNavigation
        activeStep={state.activeStep}
        goToStep={goToStep}
        filesCount={state.files.length}
        resultsCount={state.resultImages.length}
        resetForm={resetAll}
        processing={state.processing}
      />
      <section className='flex-1 overflow-auto'>
        <div className='mx-auto w-full max-w-6xl'>
          {state.activeStep === 1 && (
            <FileSelection
              activeStep={1}
              onFileSelect={handleFileSelect}
              sortedFiles={state.sortedFiles}
              goToStep={goToStep}
              resetForm={resetAll}
            />
          )}
          {state.activeStep === 2 && (
            <MetadataSettingsForm
              activeStep={2}
              settings={state.settings}
              onSettingsChange={handleSettingsChange}
              sortedFiles={state.sortedFiles}
              processing={state.processing}
              completed={state.completed}
              formRef={formRef}
              goToStep={goToStep}
              onProcessFiles={handleProcessFiles}
            />
          )}
          {state.activeStep === 3 && (
            <ResultsViewer
              activeStep={3}
              resultRef={resultRef}
              resultImages={state.resultImages}
              processing={state.processing}
              zipProgress={state.zipProgress}
              setZipProgress={setZipProgress}
              setProcessing={setProcessing}
              goToStep={goToStep}
            />
          )}
        </div>
      </section>
    </>
  );
}
