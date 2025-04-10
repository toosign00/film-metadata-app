import { zipSync, strToU8 } from 'fflate';

/**
 * 자연어 정렬 함수
 * 파일 이름을 자연스러운 순서로 정렬
 */
export const naturalSort = (a, b) => {
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

export const downloadAllAsZip = async (resultImages, setProcessing, setZipProgress, setIsZipCompressing) => {
  if (resultImages.length === 0) {
    alert('다운로드할 이미지가 없습니다.');
    return;
  }

  setProcessing(true);
  setZipProgress(0);
  setIsZipCompressing(true);

  // 50장씩 나누기
  const chunkSize = 50;
  const chunks = [];
  for (let i = 0; i < resultImages.length; i += chunkSize) {
    chunks.push(resultImages.slice(i, i + chunkSize));
  }

  try {
    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
      const chunk = chunks[chunkIndex];

      const zipObj = {};

      for (let i = 0; i < chunk.length; i++) {
        const img = chunk[i];
        const res = await fetch(img.url);
        const blob = await res.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Arr = new Uint8Array(arrayBuffer);

        zipObj[img.name] = [uint8Arr];

        const percent = Math.round(((i + 1) / chunk.length) * 100);
        setZipProgress(percent);
      }

      const zipData = zipSync(zipObj, {
        level: 6,
      });

      const now = new Date();
      const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
      const zipFilename = `film_metadata_part${chunkIndex + 1}_${timestamp}.zip`;

      const blob = new Blob([zipData], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = zipFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url); // 메모리 해제
    }

    alert(`${resultImages.length}개 파일을 2개의 ZIP 파일로 압축 완료했습니다.`);
  } catch (err) {
    console.error('ZIP 압축 실패:', err);
    alert('압축 중 오류가 발생했습니다.');
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
