import { StepIntro } from '@/components/layout/StepIntro';
import { Button } from '@/components/ui/Button';
import { DropZone } from '@/components/ui/DropZone';
import { FileList } from '@/components/ui/FileList';
import { FileSummary } from '@/components/ui/FileSummary';
import type { FileSelectionProps } from '@/types/fileSelection.types';

export const FileSelection = ({
  activeStep,
  onFileSelect,
  sortedFiles,
  goToStep,
}: FileSelectionProps) => {
  if (activeStep !== 1) {
    return null;
  }

  return (
    <section aria-labelledby='file-section'>
      <StepIntro
        eyebrow='01 / SELECT'
        title='이미지를 선택하세요'
        titleId='file-section'
        description={<p>JPG 또는 JPEG 파일을 선택하면 촬영 순서대로 정렬해요.</p>}
      />
      <div className='grid gap-4 md:grid-cols-[1.2fr_0.8fr]'>
        <DropZone onFileSelect={onFileSelect} filesCount={sortedFiles.length} />
        <FileList files={sortedFiles} />
      </div>
      <FileSummary files={sortedFiles} />
      <div className='mt-8 flex justify-end'>
        <Button disabled={sortedFiles.length === 0} onClick={() => goToStep(2)}>
          다음 단계 →
        </Button>
      </div>
    </section>
  );
};
