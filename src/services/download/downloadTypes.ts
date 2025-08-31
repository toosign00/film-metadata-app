/**
 * @module services/download/downloadTypes
 * 다운로드 서비스 관련 타입 정의
 */

export interface FileSystemFileHandle {
  createWritable(): Promise<WritableStream>;
}

export interface ShowSaveFilePickerOptions {
  suggestedName?: string;
  types?: Array<{
    description: string;
    accept: Record<string, string[]>;
  }>;
}

export interface WindowWithFileSystemAccess extends Window {
  showSaveFilePicker: (options?: ShowSaveFilePickerOptions) => Promise<FileSystemFileHandle>;
}

export function hasFileSystemAccess(w: Window): w is WindowWithFileSystemAccess {
  return 'showSaveFilePicker' in w;
}