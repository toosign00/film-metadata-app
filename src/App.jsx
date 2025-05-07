import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import StepNavigation from './components/StepNavigation';
import FileSelection from './components/FileSelection';
import MetadataSettings from './components/MetadataSettings';
import ResultsViewer from './components/ResultsViewer';
import ErrorDisplay from './components/ErrorDisplay';
import Footer from './components/Footer';
import GlobalStyles from './components/GlobalStyles';
import { naturalSort } from './utils';
import { processMetadata } from './utils/metadataUtils';
import { isMobile } from 'react-device-detect';

const App = () => {
  const [files, setFiles] = useState([]);
  const [sortedFiles, setSortedFiles] = useState([]);
  const [settings, setSettings] = useState({
    startDate: new Date(),
    startTime: new Date().setHours(0, 0, 0, 0),
    cameraMake: '',
    cameraModel: '',
    filmInfo: '',
    lens: '',
    lensInfo: '',
    isoValue: '',
  });
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [errors, setErrors] = useState([]);
  const [resultImages, setResultImages] = useState([]);
  const [zipProgress, setZipProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(1);
  const [isZipCompressing, setIsZipCompressing] = useState(false);
  const resultRef = useRef(null);
  const formRef = useRef(null);

  // 모바일 접근 제한 메시지 상태
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setShowMobileWarning(true);
    }
  }, []);

  // 파일 선택 핸들러
  const handleFileSelect = (selectedFiles) => {
    setFiles(selectedFiles);

    // 자연어 정렬 적용
    const sorted = [...selectedFiles].sort(naturalSort);
    setSortedFiles(sorted);
  };

  // 설정 변경 핸들러
  const handleSettingsChange = (name, value) => {
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 메타데이터 처리 시작 함수
  const processFiles = async (e) => {
    e.preventDefault();

    if (sortedFiles.length === 0) {
      alert('처리할 파일을 선택해주세요.');
      return;
    }

    setProcessing(true);
    setCompleted(0);
    setErrors([]);
    setResultImages([]);

    try {
      // 날짜와 시간을 하나의 Date 객체로 합치기
      const combinedDateTime = new Date(settings.startDate);
      const timeDate = new Date(settings.startTime);
      combinedDateTime.setHours(timeDate.getHours(), timeDate.getMinutes(), timeDate.getSeconds());

      const results = await processMetadata(sortedFiles, combinedDateTime, settings, (completed) => setCompleted(completed));

      setResultImages(results.images);
      setErrors(results.errors);

      // 처리 완료 후 자동으로 결과 섹션으로 이동
      if (results.images.length > 0) {
        setActiveStep(3);
        // 결과 섹션으로 스크롤
        setTimeout(() => {
          resultRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 500);
      }
    } catch (error) {
      console.error('Processing error:', error);
    } finally {
      setProcessing(false);
    }
  };

  // 단계 전환 핸들러
  const goToStep = (step) => {
    setActiveStep(step);
  };

  // 빈 양식으로 초기화
  const resetForm = () => {
    if (window.confirm('모든 설정을 초기화하고 처음부터 다시 시작하시겠습니까?')) {
      setSettings({
        startDate: new Date(),
        startTime: new Date().setHours(8, 0, 0, 0),
        cameraMake: '',
        cameraModel: '',
        filmInfo: '',
        lens: '',
        lensInfo: '',
        isoValue: '',
      });
      setFiles([]);
      setSortedFiles([]);
      setResultImages([]);
      setErrors([]);
      setActiveStep(1);
    }
  };

  if (showMobileWarning) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-gray-900 text-gray-200">
        <GlobalStyles />
        <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
          <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm rounded-lg shadow-lg border border-gray-700/50">
            <div className="p-6 text-center">
              <svg className="mx-auto h-16 w-16 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h2 className="mt-6 text-2xl font-semibold text-gray-100">PC 환경에서 이용해주세요</h2>
              <p className="mt-4 text-gray-400">현재 모바일 환경에서는 서비스 이용이 제한됩니다.</p>
              <p className="mt-2 text-gray-400">원활한 이용을 위해 PC에서 접속해주시기 바랍니다.</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-900 text-gray-200">
      <GlobalStyles />
      <Header />

      <StepNavigation
        activeStep={activeStep}
        goToStep={goToStep}
        filesCount={files.length}
        resultsCount={resultImages.length}
        resetForm={resetForm}
      />

      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="max-w-6xl mx-auto w-full">
          <FileSelection
            activeStep={activeStep}
            onFileSelect={handleFileSelect}
            sortedFiles={sortedFiles}
            goToStep={goToStep}
            resetForm={resetForm}
          />

          <MetadataSettings
            activeStep={activeStep}
            settings={settings}
            onSettingsChange={handleSettingsChange}
            sortedFiles={sortedFiles}
            processing={processing}
            completed={completed}
            formRef={formRef}
            goToStep={goToStep}
            onProcessFiles={processFiles}
          />

          <ResultsViewer
            activeStep={activeStep}
            resultRef={resultRef}
            resultImages={resultImages}
            processing={processing}
            zipProgress={zipProgress}
            isZipCompressing={isZipCompressing}
            setZipProgress={setZipProgress}
            setProcessing={setProcessing}
            setIsZipCompressing={setIsZipCompressing}
            goToStep={goToStep}
          />

          {errors.length > 0 && <ErrorDisplay errors={errors} />}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default App;
