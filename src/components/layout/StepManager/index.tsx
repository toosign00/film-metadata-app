import React, { useState, useCallback, useRef } from 'react';
import { ResultsViewer, FileSelection, MetadataSettings, ErrorDisplay, StepNavigation } from '@/components/layout';
import { useFileHandlers } from '@/hooks/useFileHandlers';
import { useMetadataHandlers } from '@/hooks/useMetadataHandlers';
import { STEPS } from '@/config/constants';
import { StepManagerProps } from '@/types/step-manager.type';
import { InitialSettings } from '@/types/config.type';

/**
 * 단계 관리 컴포넌트
 * 파일 선택, 메타데이터 설정, 결과 보기 등의 단계를 관리합니다.
 *
 * @returns {JSX.Element} 단계 관리 UI
 */
const StepManager: React.FC<StepManagerProps> = ({ onComplete }) => {
  const [activeStep, setActiveStep] = useState(STEPS.FILE_SELECTION);
  const [zipProgress, setZipProgress] = useState(0);

  const resultRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { files, sortedFiles, processing, completed, errors, resultImages, handleFileSelect, processFiles, resetFiles, setProcessing } =
    useFileHandlers({
      onComplete: (results) => {
        setActiveStep(STEPS.RESULTS_VIEW);
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 500);
        onComplete?.(
          results.images.map((img) => ({
            ...img,
            file: new File([], img.name),
            dateTime: img.dateTime || '',
          }))
        );
      },
    });

  const { settings, handleSettingsChange, resetSettings } = useMetadataHandlers();

  const goToStep = useCallback((step: number) => {
    setActiveStep(step);
  }, []);

  const resetForm = useCallback(() => {
    if (window.confirm('모든 설정을 초기화하고 처음부터 다시 시작하시겠습니까?')) {
      resetSettings();
      resetFiles();
      setActiveStep(STEPS.FILE_SELECTION);
    }
  }, [resetSettings, resetFiles]);

  const handleProcessFiles = useCallback(
    (e: React.FormEvent) => {
      const metadataSettings: InitialSettings = {
        ...settings,
        startTime: new Date(settings.startTime).getTime(),
      };
      processFiles(e, metadataSettings);
    },
    [processFiles, settings]
  );

  const handleSettingsChangeWrapper = useCallback(
    (name: string, value: any) => {
      handleSettingsChange(name as keyof InitialSettings, value);
    },
    [handleSettingsChange]
  );

  return (
    <>
      <StepNavigation
        activeStep={activeStep}
        goToStep={goToStep}
        filesCount={files.length}
        resultsCount={resultImages.length}
        resetForm={resetForm}
      />

      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-6xl mx-auto w-full">
          <FileSelection
            activeStep={activeStep}
            onFileSelect={handleFileSelect}
            sortedFiles={sortedFiles}
            goToStep={goToStep}
            resetForm={resetForm}
          />

          <MetadataSettings
            activeStep={activeStep}
            settings={{
              ...settings,
              startTime: new Date(settings.startTime),
            }}
            onSettingsChange={handleSettingsChangeWrapper}
            sortedFiles={sortedFiles}
            processing={processing}
            completed={completed}
            formRef={formRef as React.RefObject<HTMLFormElement>}
            goToStep={goToStep}
            onProcessFiles={handleProcessFiles}
          />

          <ResultsViewer
            activeStep={activeStep}
            resultRef={resultRef as React.RefObject<HTMLElement>}
            resultImages={resultImages.map((img) => ({
              ...img,
              file: new File([], img.name),
              dateTime: img.dateTime || '',
            }))}
            processing={processing}
            zipProgress={zipProgress}
            setZipProgress={setZipProgress}
            setProcessing={setProcessing}
            goToStep={goToStep}
          />

          {errors.length > 0 && (
            <ErrorDisplay
              errors={errors.map((err) => ({
                file: '파일',
                error: err,
              }))}
            />
          )}
        </div>
      </main>
    </>
  );
};

export default StepManager;
