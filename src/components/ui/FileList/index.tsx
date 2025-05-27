import React from 'react';
import { FileListProps } from '../../../types/fileList.type';

const FileList: React.FC<FileListProps> = ({ files }) => {
  if (!files || files.length === 0) return null;

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-md h-full flex flex-col" style={{ maxHeight: '300px' }}>
      <div className="flex justify-between items-center p-3 border-b border-gray-700">
        <h3 className="font-medium text-gray-200">파일 처리 순서</h3>
        <span className="text-sm text-gray-300 bg-gray-700 px-2 py-0.5 rounded-full">{files.length}개</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <ol className="text-sm text-gray-300 list-decimal list-inside">
          {files.map((file, idx) => (
            <li key={idx} className="mb-1 flex items-center">
              <span className="mr-1 truncate">{file.name}</span>
              <span className="text-xs text-gray-500 ml-auto whitespace-nowrap">{(file.size / 1024).toFixed(1)} KB</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default FileList;
