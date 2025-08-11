import type { FileListProps } from '@/types/fileList.type';

export const FileList = ({ files }: FileListProps) => {
  if (!files || files.length === 0) return null;

  return (
    <div
      className='flex h-full flex-col rounded-lg border border-gray-700 bg-gray-800 shadow-md'
      style={{ maxHeight: '300px' }}
    >
      <div className='flex items-center justify-between border-b border-gray-700 p-3'>
        <h3 className='font-medium text-gray-200'>파일 처리 순서</h3>
        <span className='rounded-full bg-gray-700 px-2 py-0.5 text-sm text-gray-300'>
          {files.length}개
        </span>
      </div>
      <div className='flex-1 overflow-y-auto p-3'>
        <ol className='list-inside list-decimal text-sm text-gray-300'>
          {files.map((file, idx) => (
            <li key={`${file.name}-${idx}`} className='mb-1 flex items-center'>
              <span className='mr-1 truncate'>{file.name}</span>
              <span className='ml-auto text-xs whitespace-nowrap text-gray-500'>
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};
