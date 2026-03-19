export interface PresetData {
  cameraMake: string;
  cameraModel: string;
  filmInfo: string;
  lens: string;
  focalLength: string;
  aperture: string;
  isoValue: string;
}

export interface Preset {
  id: string;
  name: string;
  data: PresetData;
  createdAt: number;
}
