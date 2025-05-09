declare module 'piexifjs' {
  const ImageIFD: {
    Make: number;
    Model: number;
    ImageDescription: number;
    Software: number;
  };

  const ExifIFD: {
    DateTimeOriginal: number;
    DateTimeDigitized: number;
    LensModel: number;
    UserComment: number;
    FocalLength: number;
    FNumber: number;
    ISOSpeedRatings: number;
  };

  function dump(exifObj: {
    '0th': { [key: number]: string };
    Exif: { [key: number]: string | number | [number, number] };
    GPS: { [key: number]: any };
  }): any;

  function insert(exifBytes: any, imageData: string): string;

  export { ImageIFD, ExifIFD, dump, insert };
}
