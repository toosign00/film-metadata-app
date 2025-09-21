import piexifjs from 'piexifjs';
import type {
  MetadataResult,
  MetadataSettings,
  ProcessMetadataResults,
  ProgressCallback,
} from '@/types/metadata.type';
import { dataURItoBlob } from '@/utils/convertUtils';

// 렌즈 정보 문자열을 표준화하는 함수
export function normalizeLensInfo(lensInfo: string): string {
  if (!lensInfo) return '';
  let processed = lensInfo.toLowerCase();
  processed = processed.replace(/f[\s.]+(\d+)/i, 'f$1');
  return processed;
}

// 단일 파일의 EXIF 메타데이터를 설정하는 함수
export async function setMetadata(
  file: File,
  dateTime: Date,
  settings: MetadataSettings
): Promise<MetadataResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        // 원본 EXIF에서 Orientation을 보존
        // 일부 기기(특히 스마트폰)는 픽셀 데이터를 회전하지 않고 Orientation 태그만 설정하므로
        // 이를 덮어쓰면 미리보기/저장 시 이미지가 눕거나 서는 등 잘못 표시될 수 있음
        const originalDataUri = e.target?.result as string;
        let preservedOrientation: number | undefined;
        try {
          const originalExif = piexifjs.load(originalDataUri);
          preservedOrientation = originalExif?.['0th']?.[piexifjs.ImageIFD.Orientation] as
            | number
            | undefined;
        } catch (_) {
          // 원본에 EXIF가 없거나 파싱 실패 시 무시하고 기본값(1)을 사용
        }

        const zeroth: Record<number, string> = {};
        const exif: Record<number, string | number | number[]> = {};
        const gps: Record<number, string | number | number[]> = {};

        const year = dateTime.getFullYear();
        const month = String(dateTime.getMonth() + 1).padStart(2, '0');
        const day = String(dateTime.getDate()).padStart(2, '0');
        const hours = String(dateTime.getHours()).padStart(2, '0');
        const minutes = String(dateTime.getMinutes()).padStart(2, '0');
        const seconds = String(dateTime.getSeconds()).padStart(2, '0');
        const dateTimeStr = `${year}:${month}:${day} ${hours}:${minutes}:${seconds}`;

        zeroth[piexifjs.ImageIFD.Make] = settings.cameraMake;
        zeroth[piexifjs.ImageIFD.Model] = settings.cameraModel;
        zeroth[piexifjs.ImageIFD.ImageDescription] =
          `Shot on ${settings.cameraModel} with ${settings.filmInfo}`;
        zeroth[piexifjs.ImageIFD.Software] = 'Film Metadata Web App';
        // Orientation을 원본 값으로 보존(없으면 1로 설정)
        // 유효 범위(1~8) 밖의 값은 무시하고 1로 설정
        const orientation =
          typeof preservedOrientation === 'number' &&
          preservedOrientation >= 1 &&
          preservedOrientation <= 8
            ? preservedOrientation
            : 1;
        // piexifjs 타입 정의상 zeroth 객체는 string 타입이지만, 런타임에서는 숫자 값도 허용
        // 따라서 as unknown as string 캐스팅을 사용하지 않고 그대로 할당
        // @ts-expect-error piexifjs 런타임에서는 숫자 허용
        zeroth[piexifjs.ImageIFD.Orientation] = orientation;

        exif[piexifjs.ExifIFD.DateTimeOriginal] = dateTimeStr;
        exif[piexifjs.ExifIFD.DateTimeDigitized] = dateTimeStr;
        exif[piexifjs.ExifIFD.LensModel] = settings.lens;
        exif[piexifjs.ExifIFD.UserComment] =
          `Film: ${settings.filmInfo}, Lens: ${settings.lensInfo}`;

        const processedLensInfo = normalizeLensInfo(settings.lensInfo);
        const focalLength = processedLensInfo.match(/^(\d+(\.\d+)?)/);
        if (focalLength) {
          exif[piexifjs.ExifIFD.FocalLength] = [parseInt(focalLength[1], 10), 1];
        }

        const fNumberMatch = processedLensInfo.match(/f(\d+\.?\d*)/);
        if (fNumberMatch) {
          const fNumber = parseFloat(fNumberMatch[1]);
          exif[piexifjs.ExifIFD.FNumber] = [fNumber * 10, 10];
        }

        if (settings.isoValue) {
          exif[piexifjs.ExifIFD.ISOSpeedRatings] = parseInt(settings.isoValue, 10);
        }

        const exifObj = { '0th': zeroth, Exif: exif, GPS: gps };
        const exifBytes = piexifjs.dump(exifObj);
        const newImageData = piexifjs.insert(exifBytes, originalDataUri);
        const imageType = file.type || 'image/jpeg';
        const newBlob = dataURItoBlob(newImageData, imageType);
        const newFile = new File([newBlob], file.name, { type: imageType });
        const url = URL.createObjectURL(newBlob);

        resolve({ file: newFile, url, name: file.name, dateTime: dateTimeStr });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsDataURL(file);
  });
}

// 파일 배열에 대해 메타데이터를 일괄 처리
export async function processMetadata(
  files: File[],
  startDateTime: Date,
  settings: MetadataSettings,
  onProgress: ProgressCallback
): Promise<ProcessMetadataResults> {
  const results: ProcessMetadataResults = { images: [], errors: [] };

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileDateTime = new Date(startDateTime.getTime() + i * 1000);
    try {
      const result = await setMetadata(file, fileDateTime, settings);
      results.images.push(result);
      onProgress(i + 1);
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      results.errors.push({ file: file.name, error: (error as Error).message });
    }
  }

  return results;
}
