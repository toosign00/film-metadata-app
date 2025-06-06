declare module 'piexifjs' {
  export const ImageIFD: {
    Make: number;
    Model: number;
    ImageDescription: number;
    Software: number;
  };

  export const ExifIFD: {
    DateTimeOriginal: number;
    DateTimeDigitized: number;
    LensModel: number;
    UserComment: number;
    FocalLength: number;
    FNumber: number;
    ISOSpeedRatings: number;
  };

  export function dump(exifObj: any): string;
  export function insert(exifStr: string, dataURI: string): string;
}
