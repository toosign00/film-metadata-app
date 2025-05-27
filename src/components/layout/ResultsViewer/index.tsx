import React from 'react';
import { ImageCard, ProgressBar, Button } from '../../ui';
import { downloadFile, createZipFile } from '../../../utils';
import { ResultsViewerProps } from '@/types/results-viewer.type';

const ResultsViewer: React.FC<ResultsViewerProps> = ({
  activeStep,
  resultRef,
  resultImages,
  processing,
  zipProgress,
  setZipProgress,
  setProcessing,
  goToStep,
}) => {
  if (activeStep !== 3) {
    return null;
  }

  const handleDownloadAll = async () => {
    try {
      setProcessing(true);
      await createZipFile(resultImages, setZipProgress, setProcessing, setProcessing);
    } catch (error) {
      console.error('ZIP 다운로드 중 오류:', error);
      setProcessing(false);
    }
  };

  return (
    <section ref={resultRef} className="mb-8 transition-all" aria-labelledby="results-section">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 md:p-6 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
          <h2 id="results-section" className="text-xl font-bold text-gray-200 flex items-center">
            <span className="flex items-center justify-center bg-blue-600 text-white rounded-full w-6 h-6 text-sm mr-2">3</span>
            {resultImages.length > 0 ? `처리 결과 (${resultImages.length}개 파일)` : '처리 결과'}
          </h2>
          {resultImages.length > 0 && (
            <Button
              variant="primary"
              onClick={handleDownloadAll}
              disabled={processing}
              isLoading={processing && zipProgress > 0}
              icon={
                !processing ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                ) : null
              }
              className="w-full sm:w-auto flex justify-center items-center h-10"
            >
              {processing && zipProgress > 0 ? (
                `${zipProgress}%`
              ) : (
                <>
                  <span className="inline">ZIP 다운로드</span>
                </>
              )}
            </Button>
          )}
        </div>

        {/* 압축 진행 상태 표시 */}
        {processing && zipProgress > 0 && <ProgressBar progress={zipProgress} label="ZIP 파일 생성 중" />}

        {resultImages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {resultImages.map((image, idx) => (
              <ImageCard key={idx} image={image} onDownload={downloadFile} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-900 rounded-lg border border-gray-700 p-8 text-center shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto text-gray-500 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-300">처리된 이미지가 여기에 표시됩니다.</p>
            <p className="text-sm text-gray-500 mt-2">메타데이터를 설정하기 위해 2단계로 이동하세요.</p>
            <button
              onClick={() => goToStep(2)}
              className="mt-4 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-600 transition"
            >
              메타데이터 설정으로 이동
            </button>
          </div>
        )}

        {/* 이전 단계로 버튼 */}
        <div className="mt-6">
          <Button variant="text" onClick={() => goToStep(2)}>
            &larr; 이전 단계로
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ResultsViewer;
