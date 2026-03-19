import type { Preset, PresetData } from '@/types/preset.types';

const STORAGE_KEY = 'metadata-presets';

function readPresets(): Preset[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Preset[];
  } catch {
    return [];
  }
}

function writePresets(presets: Preset[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

export function getPresets(): Preset[] {
  return readPresets().sort((a, b) => b.createdAt - a.createdAt);
}

export function savePreset(name: string, data: PresetData): Preset {
  const presets = readPresets();
  const preset: Preset = {
    id: crypto.randomUUID(),
    name: name.trim(),
    data,
    createdAt: Date.now(),
  };
  presets.push(preset);
  writePresets(presets);
  return preset;
}

export function deletePreset(id: string): void {
  const presets = readPresets().filter((p) => p.id !== id);
  writePresets(presets);
}

const PRESET_DATA_KEYS: (keyof PresetData)[] = [
  'cameraMake',
  'cameraModel',
  'filmInfo',
  'lens',
  'focalLength',
  'aperture',
  'isoValue',
];

function isValidPresetData(data: unknown): data is PresetData {
  if (typeof data !== 'object' || data === null) return false;
  return PRESET_DATA_KEYS.every(
    (key) => key in data && typeof (data as Record<string, unknown>)[key] === 'string'
  );
}

function isValidPresetArray(arr: unknown): arr is Array<{ name: string; data: PresetData }> {
  if (!Array.isArray(arr)) return false;
  return arr.every(
    (item) =>
      typeof item === 'object' &&
      item !== null &&
      typeof item.name === 'string' &&
      isValidPresetData(item.data)
  );
}

export function exportPresets(): void {
  const presets = readPresets();
  if (presets.length === 0) return;

  const exportData = presets.map(({ name, data }) => ({ name, data }));
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `film-metadata-presets-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importPresets(file: File): Promise<number> {
  const text = await file.text();
  const parsed: unknown = JSON.parse(text);

  if (!isValidPresetArray(parsed)) {
    throw new Error('올바르지 않은 프리셋 파일 형식입니다.');
  }

  const existing = readPresets();
  const newPresets: Preset[] = parsed.map((item) => ({
    id: crypto.randomUUID(),
    name: item.name,
    data: item.data,
    createdAt: Date.now(),
  }));

  writePresets([...existing, ...newPresets]);
  return newPresets.length;
}
