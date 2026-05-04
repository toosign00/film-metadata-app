import type { FileListProps } from '@/types/fileList.types';

export const FileList = ({ files }: FileListProps) => {
  if (!files || files.length === 0) return null;

  return (
    <div
      className='flex h-full flex-col rounded-xl border border-border bg-surface'
      style={{ maxHeight: '300px' }}
    >
      <div className='flex items-center justify-between border-b border-border px-4 py-3'>
        <h3 className='text-xs font-semibold uppercase tracking-[0.06em] text-foreground-secondary'>
          파일 처리 순서
        </h3>
        <span className='rounded-full bg-surface-alt px-2 py-0.5 text-xs text-foreground-muted'>
          {files.length}개
        </span>
      </div>
      <div className='flex-1 overflow-y-auto p-3'>
        <ol className='flex flex-col gap-1.5'>
          {files.map((file, index) => (
            <li
              key={file.name}
              className='flex items-center gap-2.5 rounded-md bg-surface-alt px-3 py-2'
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
