'use client';

import { useRouter } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';
import { FileSelection } from '@/components/layout/FileSelection';
import { StepNavigation } from '@/components/layout/StepNavigation';
import { useStepStore } from '@/store/stepStore';

export function FilesClientPage() {
  const router = useRouter();
  const { files, sortedFiles, setFiles, resetAll, resultImages } = useStepStore(
    useShallow((s) => ({
      files: s.files,
      sortedFiles: s.sortedFiles,
      setFiles: s.setFiles,
      resetAll: s.resetAll,
      resultImages: s.resultImages,
    }))
  );

  // 1단계에서는 새로고침 안내 다이얼로그를 사용하지 않습니다.

  const goToStep = (step: number) => {
    if (step === 2) router.push('/metadata');
    if (step === 3) router.push('/results');
  };

  const handleFileSelect = (selected: File[]) => setFiles(selected);

  return (
    <>
      <StepNavigation
        activeStep={1}
        goToStep={goToStep}
        filesCount={files.length}
        resultsCount={resultImages.length}
        resetForm={resetAll}
      />
      <section className='flex-1 overflow-auto'>
        <div className='mx-auto w-full max-w-6xl'>
          <FileSelection
            activeStep={1}
            onFileSelect={handleFileSelect}
            sortedFiles={sortedFiles}
            goToStep={goToStep}
            resetForm={resetAll}
          />
        </div>
      </section>
    </>
  );
}
