'use client';

import { create } from 'zustand';
import { INITIAL_SETTINGS } from '@/config/constants';
import { processMetadata } from '@/services/metadata';
import type { MetadataSettings, ProcessMetadataResults } from '@/types/metadata.types';
import { naturalSort } from '@/utils/sortUtils';

interface StepStoreState {
  files: File[];
  sortedFiles: File[];
  settings: MetadataSettings;
  resultImages: ProcessMetadataResults['images'];
  errors: { file: string; error: string }[];
  processing: boolean;
  completed: number;
  zipProgress: number;
  setFiles: (files: File[]) => void;
  setSettings: (updater: (prev: MetadataSettings) => MetadataSettings) => void;
  setZipProgress: (value: number) => void;
  setProcessing: (value: boolean) => void;
  resetAll: () => void;
  processFiles: (settingsOverride?: Partial<MetadataSettings>) => Promise<ProcessMetadataResults>;
}

export const useStepStore = create<StepStoreState>((set, get) => ({
  files: [],
  sortedFiles: [],
  settings: INITIAL_SETTINGS,
  resultImages: [],
  errors: [],
  processing: false,
  completed: 0,
  zipProgress: 0,

  setFiles: (files) => {
    const sorted = [...files].sort(naturalSort);
    set({ files, sortedFiles: sorted });
  },

  setSettings: (updater) => {
    set((state) => ({ settings: updater(state.settings) }));
  },

  setZipProgress: (value) => set({ zipProgress: value }),
  setProcessing: (value) => set({ processing: value }),

  resetAll: () =>
    set({
      files: [],
      sortedFiles: [],
      settings: INITIAL_SETTINGS,
      resultImages: [],
      errors: [],
      processing: false,
      completed: 0,
      zipProgress: 0,
    }),

  processFiles: async (settingsOverride) => {
    const { sortedFiles, settings } = get();

    if (sortedFiles.length === 0) {
      return { images: [], errors: [] };
    }

    set({ processing: true, completed: 0, errors: [], resultImages: [] });

    try {
      // 날짜와 시간을 하나의 Date 객체로 합치기 (원본 로직 유지)
      const effectiveSettings = { ...settings, ...settingsOverride } as MetadataSettings;
      const combinedDateTime = new Date(effectiveSettings.startDate);
      const timeDate = new Date(effectiveSettings.startTime);
      combinedDateTime.setHours(
        timeDate.getHours(),
        timeDate.getMinutes(),
        timeDate.getSeconds(),
        0
      );

      const results = await processMetadata(
        sortedFiles,
        combinedDateTime,
        effectiveSettings,
        (completed: number) => set({ completed })
      );

      set({ resultImages: results.images, errors: results.errors });
      return results;
    } catch (error) {
      console.error('Processing error:', error);
      return { images: [], errors: [{ file: 'unknown', error: (error as Error).message }] };
    } finally {
      set({ processing: false });
    }
  },
}));
