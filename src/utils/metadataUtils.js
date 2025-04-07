import piexifjs from 'piexifjs';
import { dataURItoBlob } from './fileUtils';

/**
 * 메타데이터 설정 함수
 * @param {File} file - 이미지 파일
 * @param {Date} dateTime - 촬영 날짜/시간
 * @param {Object} settings - 메타데이터 설정값
 */
export const setMetadata = async (file, dateTime, settings) => {
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
          exif[piexifjs.ExifIFD.FNumber] = [fNumber * 10, 10];
        }
        
        // ISO 설정
        if (settings.isoValue) {
          exif[piexifjs.ExifIFD.ISOSpeedRatings] = parseInt(settings.isoValue);
        }

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

/**
 * 메타데이터 일괄 처리 함수
 * @param {Array} files - 처리할 파일 목록
 * @param {Date} startDateTime - 시작 날짜/시간
 * @param {Object} settings - 메타데이터 설정값
 * @param {Function} onProgress - 진행 상태 콜백 함수
 */
export const processMetadata = async (files, startDateTime, settings, onProgress) => {
  const results = {
    images: [],
    errors: []
  };

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // 각 파일의 촬영 시간 계산 (1초 간격)
    const fileDateTime = new Date(startDateTime.getTime() + (i * 1000));
    
    try {
      // 메타데이터 설정
      const result = await setMetadata(file, fileDateTime, settings);
      results.images.push(result);
      
      // 진행률 업데이트
      onProgress(i + 1);
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      results.errors.push({ file: file.name, error: error.message });
    }
  }

  return results;
};