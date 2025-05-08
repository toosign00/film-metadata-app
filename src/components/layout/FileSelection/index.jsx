import React from 'react';
import { DropZone, FileList, Button } from '../../ui';

const FileSelection = ({ activeStep, onFileSelect, sortedFiles, goToStep, resetForm }) => {
  if (activeStep !== 1) {
    return null;
  }

  return (
    <section className="mb-8 transition-all" aria-labelledby="file-section">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 md:p-6 shadow-md">
        <h2 id="file-section" className="text-xl font-bold text-gray-200 mb-4 flex items-center">
          <span className="flex items-center justify-center bg-blue-600 text-white rounded-full w-6 h-6 text-sm mr-2">1</span>
          이미지 파일 선택
        </h2>

        <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
          <div className="w-full md:w-1/2">
            <DropZone onFileSelect={onFileSelect} filesCount={sortedFiles.length} />
          </div>

          <div className="w-full md:w-1/2">
            {sortedFiles.length > 0 ? (
              <FileList files={sortedFiles} />
            ) : (
              <div
                className="bg-gray-800 rounded-lg border border-gray-700 shadow-md h-full flex items-center justify-center p-6"
                style={{ minHeight: '300px' }}
              >
                <p className="text-gray-400 text-center">파일을 선택하면 여기에 처리 순서가 표시됩니다</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <Button variant="text" onClick={resetForm}>
            초기화
          </Button>

          <Button variant="primary" disabled={sortedFiles.length === 0} onClick={() => goToStep(2)}>
            다음 단계 &rarr;
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FileSelection;
