import React, { useState, useRef } from 'react';
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
    isoValue: ''
  });
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [errors, setErrors] = useState([]);
  const [resultImages, setResultImages] = useState([]);
  const [zipProgress, setZipProgress] = useState(0);
  const fileInputRef = useRef(null);
  const formRef = useRef(null);

  // 자연어 정렬 함수
  const naturalSort = (a, b) => {
    const chunkify = (t) => {
      const tz = [];
      let x = 0, y = -1, n = 0, i, j;

      while (i = (j = t.charAt(x++)).charCodeAt(0)) {
        const m = (i === 46 || (i >= 48 && i <= 57));
        if (m !== n) {
          tz[++y] = "";
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
        const c = Number(aa[x]), d = Number(bb[x]);
        if (c == aa[x] && d == bb[x]) {
          return c - d;
        } else {
          return (aa[x] > bb[x]) ? 1 : -1;
        }
      }
    }
    return aa.length - bb.length;
  };

  // 파일 선택 핸들러
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      return ['jpg', 'jpeg', 'png'].includes(ext); // 브라우저에서는 제한된 포맷만 지원
    });
    
    setFiles(selectedFiles);
    
    // 자연어 정렬 적용
    const sorted = [...selectedFiles].sort(naturalSort);
    setSortedFiles(sorted);
  };

  // 설정 변경 핸들러
  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 메타데이터 설정 함수
  const setMetadata = async (file, dateTime) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = function(e) {
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
          zeroth[piexifjs.ImageIFD.Software] = "Film Metadata Web App";
          
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
            exif[piexifjs.ExifIFD.FNumber] = [fNumber * 10, 10]; // EXIF에서는 유리수 형태로 저장
          }
          
          // ISO 설정
          exif[piexifjs.ExifIFD.ISOSpeedRatings] = parseInt(settings.isoValue);

          // EXIF 데이터를 바이너리로 변환
          const exifObj = { "0th": zeroth, "Exif": exif, "GPS": gps };
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
            dateTime: dateTimeStr
          });
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = function() {
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
        const fileDateTime = new Date(startDateTime.getTime() + (i * 1000));
        
        try {
          // 메타데이터 설정
          const result = await setMetadata(file, fileDateTime);
          results.push(result);
          
          // 진행률 업데이트
          setCompleted(i + 1);
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          setErrors(prev => [...prev, { file: file.name, error: error.message }]);
        }
      }
      
      setResultImages(results);
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
        setZipProgress(Math.round(((i + 1) / resultImages.length) * 50)); // 50%까지는 파일 추가 진행률
      }
      
      // ZIP 파일 생성
      setZipProgress(-1); // 압축 중 상태
      const zipBlob = await zip.generateAsync({ 
        type: 'blob',
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
        onUpdate: (metadata) => {
          if (metadata.percent) {
            // 50%에서 100%까지는 압축 진행률
            setZipProgress(50 + Math.round(metadata.percent / 2));
          }
        }
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
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-3">필름 사진 메타데이터 설정 도구</h1>
        <p className="text-gray-600 text-lg">
          스캔된 필름 사진에 카메라, 렌즈, 필름 정보 등의 메타데이터를 일괄 설정합니다.
        </p>
      </header>
      
      {/* 파일 선택 영역 */}
      <section className="mb-8" aria-labelledby="file-section">
        <h2 id="file-section" className="text-xl font-bold text-blue-600 mb-4">1. 이미지 파일 선택</h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              type="file"
              id="file-input"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept=".jpg,.jpeg,.png"
              className="hidden"
              aria-describedby="file-format-info"
            />
            <button
              onClick={() => fileInputRef.current.click()}
              className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              aria-controls="file-input"
            >
              파일 선택
            </button>
            <span id="selected-files-info" className="text-gray-700 font-medium">
              {files.length > 0 ? `${files.length}개 파일 선택됨` : '파일을 선택해주세요'}
            </span>
          </div>
          <p id="file-format-info" className="text-sm text-gray-600">
            지원 형식: JPG, JPEG, PNG
          </p>
          
          {sortedFiles.length > 0 && (
            <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-100 shadow-sm">
              <h3 className="text-sm font-semibold text-blue-700 mb-2">파일이 다음 순서로 처리됩니다:</h3>
              <div className="max-h-48 overflow-y-auto pr-2">
                <ol className="text-sm text-gray-600 list-decimal list-inside">
                  {sortedFiles.map((file, idx) => (
                    <li key={idx} className="mb-1">{file.name}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* 메타데이터 설정 영역 */}
      <section className="mb-8" aria-labelledby="metadata-section">
        <h2 id="metadata-section" className="text-xl font-bold text-blue-600 mb-4">2. 메타데이터 설정</h2>
        <form ref={formRef} onSubmit={processFiles} className="bg-blue-50 rounded-lg border border-blue-100 p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label htmlFor="startDate" className="block text-gray-700 font-medium mb-2">시작 날짜</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={settings.startDate}
                onChange={handleSettingsChange}
                className="w-full px-4 py-2 bg-white border text-black border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
                required
                aria-describedby="startDate-help"
                onClick={(e) => e.target.showPicker()}
              />
              <p id="startDate-help" className="mt-1 text-sm text-gray-500">첫 번째 사진의 촬영 날짜</p>
            </div>
            
            <div className="form-group">
              <label htmlFor="startTime" className="block text-gray-700 font-medium mb-2">시작 시간</label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={settings.startTime}
                onChange={handleSettingsChange}
                className="w-full px-4 py-2 bg-white border text-black border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
                required
                aria-describedby="startTime-help"
                onClick={(e) => e.target.showPicker()}
              />
              <p id="startTime-help" className="mt-1 text-sm  text-gray-500">첫 번째 사진의 촬영 시간</p>
            </div>
            
            <div className="form-group">
              <label htmlFor="cameraMake" className="block text-gray-700 font-medium mb-2">카메라 제조사</label>
              <input
                type="text"
                id="cameraMake"
                name="cameraMake"
                value={settings.cameraMake}
                onChange={handleSettingsChange}
                placeholder="예: Canon, Nikon, Pentax"
                className="w-full px-4 py-2 bg-white border text-black border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
                aria-describedby="cameraMake-help"
              />
              <p id="cameraMake-help" className="mt-1 text-sm text-gray-500">카메라 브랜드명</p>
            </div>
            
            <div className="form-group">
              <label htmlFor="cameraModel" className="block text-gray-700 font-medium mb-2">카메라 모델</label>
              <input
                type="text"
                id="cameraModel"
                name="cameraModel"
                value={settings.cameraModel}
                onChange={handleSettingsChange}
                placeholder="예: AE-1, F3, K1000"
                className="w-full px-4 py-2 bg-white border text-black border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
                aria-describedby="cameraModel-help"
              />
              <p id="cameraModel-help" className="mt-1 text-sm text-gray-500">사용한 카메라 모델명</p>
            </div>
            
            <div className="form-group">
              <label htmlFor="lens" className="block text-gray-700 font-medium mb-2">렌즈</label>
              <input
                type="text"
                id="lens"
                name="lens"
                value={settings.lens}
                onChange={handleSettingsChange}
                placeholder="예: Canon FD, Nikkor AI-S"
                className="w-full px-4 py-2 bg-white border text-black border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
                aria-describedby="lens-help"
              />
              <p id="lens-help" className="mt-1 text-sm text-gray-500">렌즈 브랜드와 시리즈</p>
            </div>
            
            <div className="form-group">
              <label htmlFor="lensInfo" className="block text-gray-700 font-medium mb-2">렌즈 정보</label>
              <input
                type="text"
                id="lensInfo"
                name="lensInfo"
                value={settings.lensInfo}
                onChange={handleSettingsChange}
                placeholder="예: 50mm f1.8, 28mm f2.8"
                className="w-full px-4 py-2 bg-white border text-black border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
                aria-describedby="lensInfo-help"
              />
              <p id="lensInfo-help" className="mt-1 text-sm text-gray-500">초점 거리와 조리개 값 (예: 50mm f1.8)</p>
            </div>
            
            <div className="form-group">
              <label htmlFor="filmInfo" className="block text-gray-700 font-medium mb-2">필름 정보</label>
              <input
                type="text"
                id="filmInfo"
                name="filmInfo"
                value={settings.filmInfo}
                onChange={handleSettingsChange}
                placeholder="예: Kodak Portra 400, Fuji Superia 200"
                className="w-full px-4 py-2 bg-white border text-black border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
                aria-describedby="filmInfo-help"
              />
              <p id="filmInfo-help" className="mt-1 text-sm text-gray-500">필름 브랜드와 종류</p>
            </div>
            
            <div className="form-group">
              <label htmlFor="isoValue" className="block text-gray-700 font-medium mb-2">ISO 값</label>
              <input
                type="text"
                id="isoValue"
                name="isoValue"
                value={settings.isoValue}
                onChange={handleSettingsChange}
                placeholder="예: 100, 200, 400, 800"
                className="w-full px-4 py-2 bg-white text-black border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
                aria-describedby="isoValue-help"
              />
              <p id="isoValue-help" className="mt-1 text-sm text-gray-500">필름의 ISO/ASA 감도</p>
            </div>
          </div>
          
          <div className="mt-8">
            <button
              type="submit"
              disabled={processing || sortedFiles.length === 0}
              className="w-full px-6 py-3 bg-green-500 text-white text-lg font-semibold rounded-lg hover:bg-green-600 transition focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              aria-live="polite"
            >
              {processing && completed > 0 
                ? `처리 중... (${completed}/${sortedFiles.length})` 
                : '메타데이터 설정하기'}
            </button>
          </div>
        </form>
      </section>
      
      {/* 결과 영역 - 항상 보이되 내용만 동적 변경 */}
      <section className="mb-8" aria-labelledby="results-section">
        <div className="flex justify-between items-center mb-4">
          <h2 id="results-section" className="text-xl font-bold text-blue-600">
            {resultImages.length > 0 ? `처리 결과 (${resultImages.length}개 파일)` : '처리 결과'}
          </h2>
          {resultImages.length > 0 && (
            <button
              onClick={downloadAllResults}
              disabled={processing}
              className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              aria-live="polite"
            >
              {processing && zipProgress > 0 ? `압축 중... ${zipProgress}%` : '모두 다운로드 (ZIP)'}
            </button>
          )}
        </div>
        
        {/* 압축 진행 상태 표시 */}
        {processing && zipProgress > 0 && (
          <div className="mb-4" aria-live="polite">
            <p className="text-gray-700 font-medium mb-2">ZIP 파일 생성 중: {zipProgress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-blue-500 h-4 rounded-full transition-all duration-300 ease-in-out" 
                style={{ width: `${zipProgress}%` }}
                role="progressbar"
                aria-valuenow={zipProgress}
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
          </div>
        )}

        {processing && zipProgress === -1 && (
          <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 shadow-sm" aria-live="polite">
            <p className="font-medium">ZIP 파일 압축 중...</p>
          </div>
        )}
        
        {resultImages.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {resultImages.map((image, idx) => (
              <div key={idx} className="relative group rounded-lg overflow-hidden shadow-sm border border-blue-100 bg-white">
                <div className="aspect-w-4 aspect-h-3">
                  <img
                    src={image.url}
                    alt={`처리된 이미지: ${image.name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => downloadResult(image)}
                    className="px-3 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white"
                    aria-label={`${image.name} 다운로드`}
                  >
                    다운로드
                  </button>
                </div>
                <div className="p-3 bg-white">
                  <p className="text-sm font-medium text-gray-800 truncate" title={image.name}>{image.name}</p>
                  <p className="text-xs text-gray-500 truncate" title={image.dateTime}>{image.dateTime}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 bg-blue-50 rounded-lg border border-blue-100 text-center shadow-sm">
            <p className="text-gray-500">처리된 이미지가 여기에 표시됩니다.</p>
          </div>
        )}
      </section>
      
      {/* 오류 영역 */}
      {errors.length > 0 && (
        <section className="mb-8" aria-labelledby="errors-section">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200 shadow-sm">
            <h2 id="errors-section" className="text-lg font-bold text-red-700 mb-3">오류 발생 ({errors.length}개)</h2>
            <ul className="text-sm text-red-600 list-disc list-inside">
              {errors.map((error, idx) => (
                <li key={idx} className="mb-1">{error.file}: {error.error}</li>
              ))}
            </ul>
          </div>
        </section>
      )}
      
      <footer className="text-center border-t border-gray-200 pt-6 mt-8">
        <p className="text-gray-600 text-sm">
          이 도구는 이미지 파일의 EXIF 메타데이터를 브라우저에서 직접 설정합니다.<br />
          파일은 서버로 업로드되지 않으며, 모든 처리는 로컬에서 이루어집니다.
        </p>
      </footer>
    </div>
  );
};

export default FilmMetadataApp;