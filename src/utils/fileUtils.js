import JSZip from 'jszip';

/**
 * 자연어 정렬 함수
 * 파일 이름을 자연스러운 순서로 정렬
 */
export const naturalSort = (a, b) => {
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

/**
 * 결과 파일 다운로드 함수
 */
export const downloadFile = (image) => {
  const a = document.createElement('a');
  a.href = image.url;
  a.download = image.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

/**
 * 모든 결과 파일 다운로드 (ZIP 파일로)
 */
export const downloadAllAsZip = async (
  resultImages, 
  setProcessing, 
  setZipProgress, 
  setIsZipCompressing
) => {
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
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
      onUpdate: (metadata) => {
        if (metadata.percent) {
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
    setIsZipCompressing(false);
  }
};

/**
 * Data URI를 Blob으로 변환하는 유틸 함수
 */
export const dataURItoBlob = (dataURI, type) => {
  const byteString = atob(dataURI.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([ab], { type });
};