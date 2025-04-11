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

  // 모바일 화면인지 감지
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
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
