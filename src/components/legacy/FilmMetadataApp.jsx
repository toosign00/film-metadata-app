import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import piexifjs from 'piexifjs';

const FilmMetadataApp = () => {
  const [files, setFiles] = useState([]);
  const [sortedFiles, setSortedFiles] = useState([]);
  const [settings, setSettings] = useState({
    startDate: new Date().toISOString().split('T')[0],
    startTime: '08:00',
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
  const [activeStep, setActiveStep] = useState(1); // 현재 활성화된 단계
  const [isZipCompressing, setIsZipCompressing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const formRef = useRef(null);
  const resultRef = useRef(null);
  const dropAreaRef = useRef(null);

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

  // 드래그 앤 드롭 이벤트 리스너 설정
  useEffect(() => {
    const dropArea = dropAreaRef.current;

    if (!dropArea) return;

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragEnter = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files).filter((file) => {
        const ext = file.name.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg'].includes(ext);
      });

      if (droppedFiles.length > 0) {
        setFiles(droppedFiles);
        const sorted = [...droppedFiles].sort(naturalSort);
        setSortedFiles(sorted);
      }
    };

    dropArea.addEventListener('dragover', handleDragOver);
    dropArea.addEventListener('dragenter', handleDragEnter);
    dropArea.addEventListener('dragleave', handleDragLeave);
    dropArea.addEventListener('drop', handleDrop);

    return () => {
      dropArea.removeEventListener('dragover', handleDragOver);
      dropArea.removeEventListener('dragenter', handleDragEnter);
      dropArea.removeEventListener('dragleave', handleDragLeave);
      dropArea.removeEventListener('drop', handleDrop);
    };
  }, []);

  // 자연어 정렬 함수
  const naturalSort = (a, b) => {
    const chunkify = (t) => {
      const tz = [];
      let x = 0,
        y = -1,
        n = 0,
        i,
        j;

      while ((i = (j = t.charAt(x++)).charCodeAt(0))) {
        const m = i === 46 || (i >= 48 && i <= 57);
        if (m !== n) {
          tz[++y] = '';
          n = m;
        }
        tz[y] += j;
      }
      return tz;
    };

    const aa = chunkify(a.name.toLowerCase());
    const bb = chunkify(b.name.toLowerCase());

    for (let x = 0; aa[x] && bb[x]; x++) {
      if (aa[x] !== bb[x]) {
        const c = Number(aa[x]),
          d = Number(bb[x]);
        if (c == aa[x] && d == bb[x]) {
          return c - d;
        } else {
          return aa[x] > bb[x] ? 1 : -1;
        }
      }
    }
    return aa.length - bb.length;
  };

  // 파일 선택 핸들러
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files).filter((file) => {
      const ext = file.name.split('.').pop().toLowerCase();
      return ['jpg', 'jpeg'].includes(ext);
    });

    setFiles(selectedFiles);

    // 자연어 정렬 적용
    const sorted = [...selectedFiles].sort(naturalSort);
    setSortedFiles(sorted);

    // 자동으로 다음 단계로 이동하지 않음 (제거됨)
  };

  // 설정 변경 핸들러
  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 메타데이터 설정 함수
  const setMetadata = async (file, dateTime) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = function (e) {
        try {
          // 기본 EXIF 데이터 구조 생성
          const zeroth = {};
          const exif = {};
          const gps = {};

          // 날짜 시간 포맷팅 (YYYY:MM:DD HH:MM:SS)
          const year = dateTime.getFullYear();
          const month = String(dateTime.getMonth() + 1).padStart(2, '0');
          const day = String(dateTime.getDate()).padStart(2, '0');
          const hours = String(dateTime.getHours()).padStart(2, '0');
          const minutes = String(dateTime.getMinutes()).padStart(2, '0');
          const seconds = String(dateTime.getSeconds()).padStart(2, '0');
          const dateTimeStr = `${year}:${month}:${day} ${hours}:${minutes}:${seconds}`;

          // EXIF 태그 ID와 값 설정
          zeroth[piexifjs.ImageIFD.Make] = settings.cameraMake;
          zeroth[piexifjs.ImageIFD.Model] = settings.cameraModel;
          zeroth[piexifjs.ImageIFD.ImageDescription] = `Shot on ${settings.cameraModel} with ${settings.filmInfo}`;
          zeroth[piexifjs.ImageIFD.Software] = 'Film Metadata Web App';

          exif[piexifjs.ExifIFD.DateTimeOriginal] = dateTimeStr;
          exif[piexifjs.ExifIFD.DateTimeDigitized] = dateTimeStr;
          exif[piexifjs.ExifIFD.LensModel] = settings.lens;
          exif[piexifjs.ExifIFD.UserComment] = `Film: ${settings.filmInfo}, Lens: ${settings.lensInfo}`;

          // 초점 거리 추출 및 설정
          const focalLength = settings.lensInfo.match(/\d+/);
          if (focalLength) {
            exif[piexifjs.ExifIFD.FocalLength] = [parseInt(focalLength[0]), 1];
          }

          // F값 추출 및 설정
          const fNumberMatch = settings.lensInfo.match(/f(\d+\.?\d*)/);
          if (fNumberMatch) {
            const fNumber = parseFloat(fNumberMatch[1]);
            exif[piexifjs.ExifIFD.FNumber] = [fNumber * 10, 10];
          }

          // ISO 설정
          exif[piexifjs.ExifIFD.ISOSpeedRatings] = parseInt(settings.isoValue);

          // EXIF 데이터를 바이너리로 변환
          const exifObj = { '0th': zeroth, Exif: exif, GPS: gps };
          const exifBytes = piexifjs.dump(exifObj);

          // 이미지 데이터에 EXIF 추가
          const newImageData = piexifjs.insert(exifBytes, e.target.result);

          // 새 이미지 Blob 생성
          const imageType = file.type || 'image/jpeg';
          const newBlob = dataURItoBlob(newImageData, imageType);

          // 새 파일 객체 생성
          const newFile = new File([newBlob], file.name, { type: imageType });

          // 결과 URL 생성
          const url = URL.createObjectURL(newBlob);

          resolve({
            file: newFile,
            url: url,
            name: file.name,
            dateTime: dateTimeStr,
          });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = function () {
        reject(new Error(`Failed to read file: ${file.name}`));
      };

      // 이미지 데이터 읽기
      reader.readAsDataURL(file);
    });
  };

  // Data URI를 Blob으로 변환하는 유틸 함수
  const dataURItoBlob = (dataURI, type) => {
    const byteString = atob(dataURI.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type });
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

    // 시작 날짜/시간 구하기
    const [year, month, day] = settings.startDate.split('-').map(Number);
    const [hours, minutes] = settings.startTime.split(':').map(Number);
    const startDateTime = new Date(year, month - 1, day, hours, minutes);

    try {
      const results = [];

      for (let i = 0; i < sortedFiles.length; i++) {
        const file = sortedFiles[i];

        // 각 파일의 촬영 시간 계산 (1초 간격)
        const fileDateTime = new Date(startDateTime.getTime() + i * 1000);

        try {
          // 메타데이터 설정
          const result = await setMetadata(file, fileDateTime);
          results.push(result);

          // 진행률 업데이트
          setCompleted(i + 1);
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          setErrors((prev) => [...prev, { file: file.name, error: error.message }]);
        }
      }

      setResultImages(results);

      // 처리 완료 후 자동으로 결과 섹션으로 이동
      if (results.length > 0) {
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

  // 결과 파일 다운로드 함수
  const downloadResult = (image) => {
    const a = document.createElement('a');
    a.href = image.url;
    a.download = image.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 모든 결과 파일 다운로드 (ZIP 파일로)
  const downloadAllResults = async () => {
    if (resultImages.length === 0) {
      alert('다운로드할 이미지가 없습니다.');
      return;
    }

    // 처리 시작 알림
    setProcessing(true);
    setZipProgress(0);
    setIsZipCompressing(true);

    try {
      const zip = new JSZip();

      // 각 이미지 파일을 ZIP에 추가
      for (let i = 0; i < resultImages.length; i++) {
        const image = resultImages[i];
        const response = await fetch(image.url);
        const blob = await response.blob();

        // ZIP 파일에 추가
        zip.file(image.name, blob);

        // 진행률 업데이트
        setZipProgress(Math.round(((i + 1) / resultImages.length) * 50));
      }

      // ZIP 파일 생성
      setIsZipCompressing(true);
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
        onUpdate: (metadata) => {
          if (metadata.percent) {
            setZipProgress(50 + Math.round(metadata.percent / 2));
          }
        },
      });

      // 현재 날짜와 시간을 포함한 ZIP 파일명 생성
      const now = new Date();
      const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
      const zipFileName = `film_metadata_${timestamp}.zip`;

      // ZIP 파일 다운로드
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(zipBlob);
      downloadLink.download = zipFileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      alert(`${resultImages.length}개 파일이 성공적으로 ZIP으로 압축되었습니다.`);
    } catch (error) {
      console.error('ZIP 생성 중 오류 발생:', error);
      alert(`ZIP 파일 생성 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setProcessing(false);
      setZipProgress(0);
      setIsZipCompressing(false);
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
        startDate: new Date().toISOString().split('T')[0],
        startTime: '08:00',
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
    <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-xl overflow-hidden">
      {/* 앱 헤더 */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">필름 사진 메타데이터 설정 도구</h1>
        <p className="text-blue-100 md:text-lg">스캔된 필름 사진에 카메라, 렌즈, 필름 정보 등의 메타데이터를 일괄 설정합니다.</p>
      </div>

      {/* 진행 단계 표시 */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex space-x-1 w-full">
            <button
              onClick={() => goToStep(1)}
              className={`flex-1 py-2 px-2 rounded-l-lg text-sm font-medium transition-all ${
                activeStep === 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="hidden md:inline">1. 파일 선택</span>
              <span className="md:hidden">파일</span>
              {files.length > 0 && (
                <span className="ml-1 text-xs md:text-sm bg-white bg-opacity-20 text-white px-1.5 py-0.5 rounded-full">{files.length}</span>
              )}
            </button>
            <button
              onClick={() => goToStep(2)}
              disabled={files.length === 0}
              className={`flex-1 py-2 px-2 text-sm font-medium transition-all ${
                activeStep === 2
                  ? 'bg-blue-600 text-white'
                  : files.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="hidden md:inline">2. 메타데이터 설정</span>
              <span className="md:hidden">설정</span>
            </button>
            <button
              onClick={() => goToStep(3)}
              disabled={resultImages.length === 0}
              className={`flex-1 py-2 px-2 rounded-r-lg text-sm font-medium transition-all ${
                activeStep === 3
                  ? 'bg-blue-600 text-white'
                  : resultImages.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="hidden md:inline">3. 결과 확인</span>
              <span className="md:hidden">결과</span>
              {resultImages.length > 0 && (
                <span className="ml-1 text-xs md:text-sm bg-white bg-opacity-20 text-white px-1.5 py-0.5 rounded-full">{resultImages.length}</span>
              )}
            </button>
          </div>
          <button onClick={resetForm} className="ml-2 text-sm text-gray-600 hover:text-red-600 transition-colors" title="모두 초기화">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* 단계 1: 파일 선택 */}
        <section className={`mb-8 transition-all ${activeStep === 1 ? 'block' : 'hidden'}`} aria-labelledby="file-section">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 md:p-6 shadow-sm">
            <h2 id="file-section" className="text-xl font-bold text-blue-800 mb-4 flex items-center">
              <span className="flex items-center justify-center bg-blue-600 text-white rounded-full w-6 h-6 text-sm mr-2">1</span>
              이미지 파일 선택
            </h2>

            <div className="mb-6">
              <div
                ref={dropAreaRef}
                className={`border-2 border-dashed rounded-lg ${
                  isDragging ? 'border-blue-500 bg-blue-50' : files.length > 0 ? 'border-blue-300 bg-blue-50' : 'border-gray-300 bg-gray-50'
                } p-4 text-center cursor-pointer transition-all hover:border-blue-400`}
                onClick={() => fileInputRef.current.click()}
              >
                <input
                  type="file"
                  id="file-input"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  accept=".jpg,.jpeg"
                  className="hidden"
                  aria-describedby="file-format-info"
                />

                <div className="flex flex-col items-center justify-center py-5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-12 w-12 mb-2 ${isDragging ? 'text-blue-600' : files.length > 0 ? 'text-blue-500' : 'text-gray-400'}`}
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

                  {isDragging ? (
                    <div>
                      <p className="text-lg font-medium text-blue-700">파일을 여기에 놓으세요</p>
                      <p className="text-sm text-blue-600">JPG, JPEG 파일만 지원됩니다</p>
                    </div>
                  ) : files.length > 0 ? (
                    <div>
                      <p className="text-lg font-medium text-blue-700">{files.length}개의 파일이 선택됨</p>
                      <p className="text-sm text-blue-600">클릭하여 다른 파일 선택</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-lg font-medium text-gray-700">이미지 파일을 선택하세요</p>
                      <p className="text-sm text-gray-500">또는 여기에 파일을 끌어다 놓으세요</p>
                    </div>
                  )}

                  <p id="file-format-info" className="mt-2 text-xs text-gray-500">
                    지원 형식: JPG, JPEG (최대 25MB)
                  </p>
                </div>
              </div>
            </div>

            {sortedFiles.length > 0 && (
              <div className="bg-white rounded-lg border border-blue-200 shadow-sm">
                <div className="flex justify-between items-center p-3 border-b border-blue-100">
                  <h3 className="font-medium text-blue-800">파일 처리 순서</h3>
                  <span className="text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{sortedFiles.length}개</span>
                </div>
                <div className="max-h-48 overflow-y-auto p-3">
                  <ol className="text-sm text-gray-700 list-decimal list-inside">
                    {sortedFiles.map((file, idx) => (
                      <li key={idx} className="mb-1 flex items-center">
                        <span className="mr-1 truncate">{file.name}</span>
                        <span className="text-xs text-gray-500 ml-auto whitespace-nowrap">{(file.size / 1024).toFixed(1)} KB</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <button onClick={resetForm} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition">
                초기화
              </button>
              <button
                onClick={() => goToStep(2)}
                disabled={files.length === 0}
                className={`px-5 py-2 rounded-lg ${
                  files.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow transition'
                }`}
              >
                다음 단계 &rarr;
              </button>
            </div>
          </div>
        </section>

        {/* 단계 2: 메타데이터 설정 */}
        <section className={`mb-8 transition-all ${activeStep === 2 ? 'block' : 'hidden'}`} aria-labelledby="metadata-section">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 md:p-6 shadow-sm">
            <h2 id="metadata-section" className="text-xl font-bold text-blue-800 mb-4 flex items-center">
              <span className="flex items-center justify-center bg-blue-600 text-white rounded-full w-6 h-6 text-sm mr-2">2</span>
              메타데이터 설정
            </h2>

            <form ref={formRef} onSubmit={processFiles} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 촬영 정보 */}
                <div className="bg-white rounded-lg border border-blue-200 p-4 shadow-sm">
                  <h3 className="font-medium text-blue-800 mb-3 pb-2 border-b border-blue-100">촬영 날짜/시간</h3>

                  <div className="mb-4">
                    <label htmlFor="startDate" className="block text-gray-700 font-medium mb-1 text-sm">
                      시작 날짜
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        id="startDate"
                        name="startDate"
                        value={settings.startDate}
                        onChange={handleSettingsChange}
                        className="w-full px-4 py-2.5 bg-white border text-gray-800 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
                        required
                        aria-describedby="startDate-help"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    </div>
                    <p id="startDate-help" className="mt-1 text-xs text-gray-500">
                      첫 번째 사진의 촬영 날짜
                    </p>
                  </div>

                  <div>
                    <label htmlFor="startTime" className="block text-gray-700 font-medium mb-1 text-sm">
                      시작 시간
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        id="startTime"
                        name="startTime"
                        value={settings.startTime}
                        onChange={handleSettingsChange}
                        className="w-full px-4 py-2.5 bg-white border text-gray-800 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
                        required
                        aria-describedby="startTime-help"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <p id="startTime-help" className="mt-1 text-xs text-gray-500">
                      첫 번째 사진의 촬영 시간
                    </p>
                  </div>
                </div>

                {/* 카메라 정보 */}
                <div className="bg-white rounded-lg border border-blue-200 p-4 shadow-sm">
                  <h3 className="font-medium text-blue-800 mb-3 pb-2 border-b border-blue-100">카메라 정보</h3>

                  <div className="mb-4">
                    <label htmlFor="cameraMake" className="block text-gray-700 font-medium mb-1 text-sm">
                      카메라 제조사
                    </label>
                    <input
                      type="text"
                      id="cameraMake"
                      name="cameraMake"
                      value={settings.cameraMake}
                      onChange={handleSettingsChange}
                      placeholder="예: Canon, Nikon, Pentax"
                      className="w-full px-4 py-2.5 bg-white border text-gray-800 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
                      aria-describedby="cameraMake-help"
                    />
                    <p id="cameraMake-help" className="mt-1 text-xs text-gray-500">
                      카메라 브랜드명
                    </p>
                  </div>

                  <div>
                    <label htmlFor="cameraModel" className="block text-gray-700 font-medium mb-1 text-sm">
                      카메라 모델
                    </label>
                    <input
                      type="text"
                      id="cameraModel"
                      name="cameraModel"
                      value={settings.cameraModel}
                      onChange={handleSettingsChange}
                      placeholder="예: AE-1, F3, K1000"
                      className="w-full px-4 py-2.5 bg-white border text-gray-800 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
                      aria-describedby="cameraModel-help"
                    />
                    <p id="cameraModel-help" className="mt-1 text-xs text-gray-500">
                      사용한 카메라 모델명
                    </p>
                  </div>
                </div>

                {/* 렌즈 정보 */}
                <div className="bg-white rounded-lg border border-blue-200 p-4 shadow-sm">
                  <h3 className="font-medium text-blue-800 mb-3 pb-2 border-b border-blue-100">렌즈 정보</h3>

                  <div className="mb-4">
                    <label htmlFor="lens" className="block text-gray-700 font-medium mb-1 text-sm">
                      렌즈
                    </label>
                    <input
                      type="text"
                      id="lens"
                      name="lens"
                      value={settings.lens}
                      onChange={handleSettingsChange}
                      placeholder="예: Canon FD, Nikkor AI-S"
                      className="w-full px-4 py-2.5 bg-white border text-gray-800 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
                      aria-describedby="lens-help"
                    />
                    <p id="lens-help" className="mt-1 text-xs text-gray-500">
                      렌즈 브랜드와 시리즈
                    </p>
                  </div>

                  <div>
                    <label htmlFor="lensInfo" className="block text-gray-700 font-medium mb-1 text-sm">
                      렌즈 정보
                    </label>
                    <input
                      type="text"
                      id="lensInfo"
                      name="lensInfo"
                      value={settings.lensInfo}
                      onChange={handleSettingsChange}
                      placeholder="예: 50mm f1.8, 28mm f2.8"
                      className="w-full px-4 py-2.5 bg-white border text-gray-800 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
                      aria-describedby="lensInfo-help"
                    />
                    <p id="lensInfo-help" className="mt-1 text-xs text-gray-500">
                      초점 거리와 조리개 값 (예: 50mm f1.8)
                    </p>
                  </div>
                </div>

                {/* 필름 정보 */}
                <div className="bg-white rounded-lg border border-blue-200 p-4 shadow-sm">
                  <h3 className="font-medium text-blue-800 mb-3 pb-2 border-b border-blue-100">필름 정보</h3>

                  <div className="mb-4">
                    <label htmlFor="filmInfo" className="block text-gray-700 font-medium mb-1 text-sm">
                      필름 정보
                    </label>
                    <input
                      type="text"
                      id="filmInfo"
                      name="filmInfo"
                      value={settings.filmInfo}
                      onChange={handleSettingsChange}
                      placeholder="예: Kodak Portra 400, Fuji Superia 200"
                      className="w-full px-4 py-2.5 bg-white border text-gray-800 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
                      aria-describedby="filmInfo-help"
                    />
                    <p id="filmInfo-help" className="mt-1 text-xs text-gray-500">
                      필름 브랜드와 종류
                    </p>
                  </div>

                  <div>
                    <label htmlFor="isoValue" className="block text-gray-700 font-medium mb-1 text-sm">
                      ISO 값
                    </label>
                    <input
                      type="text"
                      id="isoValue"
                      name="isoValue"
                      value={settings.isoValue}
                      onChange={handleSettingsChange}
                      placeholder="예: 100, 200, 400, 800"
                      className="w-full px-4 py-2.5 bg-white border text-gray-800 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
                      aria-describedby="isoValue-help"
                    />
                    <p id="isoValue-help" className="mt-1 text-xs text-gray-500">
                      필름의 ISO 감도
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <button type="button" onClick={() => goToStep(1)} className="px-4 py-2 text-blue-600 font-medium hover:text-blue-800 transition">
                  &larr; 이전
                </button>

                <button
                  type="submit"
                  disabled={processing || sortedFiles.length === 0}
                  className={`px-5 py-2.5 rounded-lg font-medium ${
                    processing ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700 shadow transition'
                  }`}
                >
                  {processing && completed > 0 ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>
                        처리 중... ({completed}/{sortedFiles.length})
                      </span>
                    </div>
                  ) : (
                    <span>메타데이터 설정하기</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* 단계 3: 결과 확인 */}
        <section ref={resultRef} className={`mb-8 transition-all ${activeStep === 3 ? 'block' : 'hidden'}`} aria-labelledby="results-section">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 md:p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 id="results-section" className="text-xl font-bold text-blue-800 flex items-center">
                <span className="flex items-center justify-center bg-blue-600 text-white rounded-full w-6 h-6 text-sm mr-2">3</span>
                {resultImages.length > 0 ? `처리 결과 (${resultImages.length}개 파일)` : '처리 결과'}
              </h2>

              {resultImages.length > 0 && (
                <button
                  onClick={downloadAllResults}
                  disabled={processing}
                  className={`px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed shadow ${
                    isZipCompressing ? 'animate-pulse' : ''
                  }`}
                >
                  {processing && zipProgress > 0 ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>{zipProgress}%</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      <span>ZIP으로 다운로드</span>
                    </div>
                  )}
                </button>
              )}
            </div>

            {/* 압축 진행 상태 표시 */}
            {processing && zipProgress > 0 && (
              <div className="mb-4 bg-white rounded-lg border border-blue-200 p-3 shadow-sm" aria-live="polite">
                <p className="text-gray-700 font-medium mb-2">ZIP 파일 생성 중: {zipProgress}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                    style={{ width: `${zipProgress}%` }}
                    role="progressbar"
                    aria-valuenow={zipProgress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  ></div>
                </div>
              </div>
            )}

            {resultImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {resultImages.map((image, idx) => (
                  <div key={idx} className="relative group bg-white rounded-lg overflow-hidden shadow-sm border border-blue-100">
                    <div className="aspect-w-4 aspect-h-3">
                      <img src={image.url} alt={`처리된 이미지: ${image.name}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300 flex items-end justify-center">
                      <button
                        onClick={() => downloadResult(image)}
                        className="mb-4 px-3 py-1.5 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                        aria-label={`${image.name} 다운로드`}
                      >
                        다운로드
                      </button>
                    </div>
                    <div className="p-2 bg-white">
                      <p className="text-xs font-medium text-gray-800 truncate" title={image.name}>
                        {image.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate" title={image.dateTime}>
                        {image.dateTime}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-blue-100 p-8 text-center shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-gray-400 mb-3"
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
                <p className="text-gray-600">처리된 이미지가 여기에 표시됩니다.</p>
                <p className="text-sm text-gray-500 mt-2">메타데이터를 설정하기 위해 2단계로 이동하세요.</p>
                <button
                  onClick={() => goToStep(2)}
                  className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition"
                >
                  메타데이터 설정으로 이동
                </button>
              </div>
            )}

            {/* 이전 단계로 버튼 */}
            <div className="mt-6">
              <button onClick={() => goToStep(2)} className="px-4 py-2 text-blue-600 font-medium hover:text-blue-800 transition">
                &larr; 이전 단계로
              </button>
            </div>
          </div>
        </section>

        {/* 오류 영역 */}
        {errors.length > 0 && (
          <section className="mb-8" aria-labelledby="errors-section">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200 shadow-sm">
              <div className="flex items-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <h2 id="errors-section" className="text-lg font-bold text-red-700">
                  오류 발생 ({errors.length}개)
                </h2>
              </div>
              <ul className="text-sm text-red-600 list-disc list-inside">
                {errors.map((error, idx) => (
                  <li key={idx} className="mb-1">
                    {error.file}: {error.error}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>

      <footer className="text-center border-t border-gray-200 p-4 text-gray-600 text-sm bg-gray-50 rounded-b-xl">
        <p>
          이 도구는 이미지 파일의 EXIF 메타데이터를 브라우저에서 직접 설정합니다.
          <br />
          <span className="text-xs text-gray-500">파일은 서버로 업로드되지 않으며, 모든 처리는 로컬에서 이루어집니다.</span>
        </p>
      </footer>
    </div>
  );
};

export default FilmMetadataApp;
