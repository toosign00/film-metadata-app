import { Button } from '@/components/ui/Button';
import { DropZone } from '@/components/ui/DropZone';
import { FileList } from '@/components/ui/FileList';
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
    <section className='py-6' aria-labelledby='file-section'>
      <div className='rounded-xl border border-border bg-surface px-6 py-5 shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]'>
        <h2
          id='file-section'
          className='mb-5 text-xs font-semibold uppercase tracking-[0.06em] text-foreground-secondary'
        >
          이미지 파일 선택
        </h2>

        <div className='flex flex-col gap-4 md:flex-row'>
          <div className='w-full md:w-1/2'>
            <DropZone onFileSelect={onFileSelect} filesCount={sortedFiles.length} />
          </div>

          <div className='w-full md:w-1/2'>
            {sortedFiles.length > 0 ? (
              <FileList files={sortedFiles} />
            ) : (
              <div
                className='flex h-full items-center justify-center rounded-xl border border-border bg-surface-alt p-6'
                style={{ minHeight: '300px' }}
              >
                <p className='text-center text-sm text-foreground-muted'>
                  파일을 선택하면 여기에 처리 순서가 표시됩니다
                </p>
              </div>
            )}
          </div>
        </div>

        <div className='mt-5 flex justify-end'>
          <Button variant='primary' disabled={sortedFiles.length === 0} onClick={() => goToStep(2)}>
            다음 단계 &rarr;
          </Button>
        </div>
      </div>
    </section>
  );
};
