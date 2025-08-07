export interface Image {
  url: string;
  name: string;
  dateTime?: string;
}

export interface ImageCardProps {
  image: Image;
  onDownload: (image: Image) => void;
}
