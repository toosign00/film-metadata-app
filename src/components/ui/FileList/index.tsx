import type { FileListProps } from '@/types/fileList.types';

export const FileList = ({ files }: FileListProps) => {
  if (!files || files.length === 0) return null;

  return (
    <div
      className='flex h-full flex-col rounded-lg border border-border bg-surface shadow-md'
      style={{ maxHeight: '300px' }}
    >
      <div className='flex items-center justify-between border-border border-b p-3'>
        <h3 className='font-medium text-foreground'>파일 처리 순서</h3>
        <span className='rounded-full bg-muted px-2 py-0.5 text-foreground-secondary text-sm'>
          {files.length}개
        </span>
      </div>
      <div className='flex-1 overflow-y-auto p-3'>
        <ol className='list-inside list-decimal text-foreground-secondary text-sm'>
          {files.map((file) => (
            <li key={file.name} className='mb-1 flex items-center'>
              <span className='mr-1 truncate'>{file.name}</span>
              <span className='ml-auto whitespace-nowrap text-foreground-muted text-xs'>
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};
