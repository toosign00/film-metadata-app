import type { FileSummaryProps } from '@/types/fileSummary.types';

export const FileSummary = ({ files }: FileSummaryProps) => {
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  const totalMegabytes = totalBytes / 1024 / 1024;

  return (
    <dl className='mt-4 flex flex-wrap gap-2' aria-label='선택 파일 요약'>
      <div className='rounded-full border border-border bg-surface px-3 py-1.5 text-xs'>
        <dt className='sr-only'>파일 수</dt>
        <dd className='text-foreground-secondary'>{files.length} files</dd>
      </div>
      <div className='rounded-full border border-border bg-surface px-3 py-1.5 text-xs'>
        <dt className='sr-only'>전체 용량</dt>
        <dd className='text-foreground-secondary'>{totalMegabytes.toFixed(1)} MB</dd>
      </div>
      <div className='rounded-full border border-border bg-surface px-3 py-1.5 text-xs'>
        <dt className='sr-only'>지원 형식</dt>
        <dd className='text-foreground-secondary'>JPG / JPEG</dd>
      </div>
    </dl>
  );
};
