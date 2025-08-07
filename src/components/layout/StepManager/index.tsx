import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ErrorDisplay } from '@/components/layout/ErrorDisplay';
import { FileSelection } from '@/components/layout/FileSelection';
import { MetadataSettings } from '@/components/layout/MetadataSettings';
import { ResultsViewer } from '@/components/layout/ResultsViewer';
import { StepNavigation } from '@/components/layout/StepNavigation';
import { ConfirmDialog } from '@/components/ui/AlertDialog';
import { STEPS } from '@/config/constants';
import { useFileHandlers } from '@/hooks/useFileHandlers';
import { useMetadataHandlers } from '@/hooks/useMetadataHandlers';
import type { InitialSettings } from '@/types/config.type';
import type { StepManagerProps } from '@/types/step-manager.type';

/**
 * 단계 관리 컴포넌트
 * 파일 선택, 메타데이터 설정, 결과 보기 등의 단계를 관리합니다.
 *
 * @returns {JSX.Element} 단계 관리 UI
 */
export const StepManager = ({ onComplete }: StepManagerProps) => {
  const [activeStep, setActiveStep] = useState(STEPS.FILE_SELECTION);
  const [zipProgress, setZipProgress] = useState(0);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const resultRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const {
    files,
    sortedFiles,
    processing,
    completed,
    errors,
    resultImages,
    handleFileSelect,
    processFiles,
    resetFiles,
    setProcessing,
  } = useFileHandlers({
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
    setShowResetDialog(true);
  }, []);

  const handleResetConfirm = useCallback(() => {
    resetSettings();
    resetFiles();
    setActiveStep(STEPS.FILE_SELECTION);
    toast.success('설정이 초기화되었습니다.');
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
    (name: string, value: string | Date) => {
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

      <main className='flex-1 overflow-auto p-4 md:p-6'>
        <div className='mx-auto w-full max-w-6xl'>
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

          {errors.length > 0 && <ErrorDisplay errors={errors} />}
        </div>
      </main>

      <ConfirmDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
        title='설정 초기화'
        description='모든 설정을 초기화하고 처음부터 다시 시작하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
        confirmText='초기화'
        cancelText='취소'
        onConfirm={handleResetConfirm}
      />
    </>
  );
};
