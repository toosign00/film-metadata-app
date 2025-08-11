declare module 'piexifjs' {
  export const ImageIFD: {
    Make: number;
    Model: number;
    ImageDescription: number;
    Software: number;
    Orientation: number;
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

  // biome-ignore lint/suspicious/noExplicitAny: external library type definition
  export function dump(exifObj: any): string;
  export function insert(exifStr: string, dataURI: string): string;
  // biome-ignore lint/suspicious/noExplicitAny: external library type definition
  export function load(dataURI: string): any;
}
