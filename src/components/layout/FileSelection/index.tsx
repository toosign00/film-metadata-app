import { Button } from '@/components/ui/Button';
import { DropZone } from '@/components/ui/DropZone';
import { FileList } from '@/components/ui/FileList';
import type { FileSelectionProps } from '@/types/file-selection.type';

export const FileSelection = ({
  activeStep,
  onFileSelect,
  sortedFiles,
  goToStep,
  resetForm,
}: FileSelectionProps) => {
  if (activeStep !== 1) {
    return null;
  }

  return (
    <section className='mb-8 transition-all' aria-labelledby='file-section'>
      <div className='rounded-xl border border-gray-700 bg-gray-800 p-5 shadow-md md:p-6'>
        <h2 id='file-section' className='mb-4 flex items-center text-xl font-bold text-gray-200'>
          <span className='mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-sm text-white'>
            1
          </span>
          이미지 파일 선택
        </h2>

        <div className='flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4'>
          <div className='w-full md:w-1/2'>
            <DropZone onFileSelect={onFileSelect} filesCount={sortedFiles.length} />
          </div>

          <div className='w-full md:w-1/2'>
            {sortedFiles.length > 0 ? (
              <FileList files={sortedFiles} />
            ) : (
              <div
                className='flex h-full items-center justify-center rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-md'
                style={{ minHeight: '300px' }}
              >
                <p className='text-center text-gray-400'>
                  파일을 선택하면 여기에 처리 순서가 표시됩니다
                </p>
              </div>
            )}
          </div>
        </div>

        <div className='mt-6 flex justify-between'>
          <Button variant='text' onClick={resetForm}>
            초기화
          </Button>

          <Button variant='primary' disabled={sortedFiles.length === 0} onClick={() => goToStep(2)}>
            다음 단계 &rarr;
          </Button>
        </div>
      </div>
    </section>
  );
};
