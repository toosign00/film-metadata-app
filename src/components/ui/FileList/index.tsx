import type { FileListProps } from '@/types/fileList.types';

export const FileList = ({ files }: FileListProps) => {
  if (!files || files.length === 0) {
    return (
      <div className='flex min-h-[280px] items-center justify-center rounded-2xl border border-border bg-surface p-6'>
        <p className='text-center text-sm text-foreground-muted'>
          파일을 선택하면 처리 순서를 보여드려요
        </p>
      </div>
    );
  }

  return (
    <div className='flex min-h-[280px] max-h-[360px] flex-col rounded-2xl border border-border bg-surface'>
      <div className='flex items-center justify-between border-b border-border px-4 py-3'>
        <h3 className='text-xs font-semibold uppercase tracking-[0.06em] text-foreground-secondary'>
          Selected files
        </h3>
        <span className='rounded-full bg-surface-alt px-2 py-0.5 text-xs text-foreground-muted'>
          {files.length}개
        </span>
      </div>
      <div className='flex-1 overflow-y-auto px-4'>
        <ol>
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.lastModified}-${file.size}`}
              className='flex items-center gap-2.5 border-b border-border py-2.5 last:border-0'
            >
              <span className='w-4 shrink-0 text-right text-xs text-foreground-muted'>
                {index + 1}
              </span>
              <span className='flex-1 truncate text-sm text-foreground-secondary'>{file.name}</span>
              <span className='shrink-0 whitespace-nowrap text-xs text-foreground-muted'>
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};
