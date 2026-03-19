'use client';

import { useCallback, useReducer } from 'react';
import { INITIAL_SETTINGS } from '@/config/constants';
import { processMetadata } from '@/services/metadata';
import type {
  MetadataResult,
  MetadataSettings,
  ProcessMetadataResults,
} from '@/types/metadata.types';
import { naturalSort } from '@/utils/sortUtils';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export interface AppState {
  activeStep: number;
  files: File[];
  sortedFiles: File[];
  settings: MetadataSettings;
  resultImages: MetadataResult[];
  errors: { file: string; error: string }[];
  processing: boolean;
  completed: number;
  zipProgress: number;
}

const initialState: AppState = {
  activeStep: 1,
  files: [],
  sortedFiles: [],
  settings: INITIAL_SETTINGS,
  resultImages: [],
  errors: [],
  processing: false,
  completed: 0,
  zipProgress: 0,
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type AppAction =
  | { type: 'SET_FILES'; files: File[]; sortedFiles: File[] }
  | { type: 'SET_SETTINGS'; updater: (prev: MetadataSettings) => MetadataSettings }
  | { type: 'SET_STEP'; step: number }
  | { type: 'PROCESS_START' }
  | { type: 'PROCESS_PROGRESS'; completed: number }
  | {
      type: 'PROCESS_COMPLETE';
      images: MetadataResult[];
      errors: { file: string; error: string }[];
    }
  | { type: 'PROCESS_ERROR'; errors: { file: string; error: string }[] }
  | { type: 'SET_ZIP_PROGRESS'; value: number }
  | { type: 'SET_PROCESSING'; value: boolean }
  | { type: 'RESET_ALL' };

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_FILES':
      return { ...state, files: action.files, sortedFiles: action.sortedFiles };
    case 'SET_SETTINGS':
      return { ...state, settings: action.updater(state.settings) };
    case 'SET_STEP':
      return { ...state, activeStep: action.step };
    case 'PROCESS_START':
      return { ...state, processing: true, completed: 0, errors: [], resultImages: [] };
    case 'PROCESS_PROGRESS':
      return { ...state, completed: action.completed };
    case 'PROCESS_COMPLETE':
      return { ...state, resultImages: action.images, errors: action.errors, processing: false };
    case 'PROCESS_ERROR':
      return { ...state, errors: action.errors, processing: false };
    case 'SET_ZIP_PROGRESS':
      return { ...state, zipProgress: action.value };
    case 'SET_PROCESSING':
      return { ...state, processing: action.value };
    case 'RESET_ALL':
      return { ...initialState, settings: INITIAL_SETTINGS };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Blob URL 해제 헬퍼
// ---------------------------------------------------------------------------

function revokeBlobUrls(images: MetadataResult[]) {
  for (const image of images) {
    if (image.url?.startsWith('blob:')) {
      URL.revokeObjectURL(image.url);
    }
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAppReducer() {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const setFiles = useCallback((files: File[]) => {
    const sortedFiles = [...files].sort(naturalSort);
    dispatch({ type: 'SET_FILES', files, sortedFiles });
  }, []);

  const setSettings = useCallback((updater: (prev: MetadataSettings) => MetadataSettings) => {
    dispatch({ type: 'SET_SETTINGS', updater });
  }, []);

  const goToStep = useCallback((step: number) => {
    dispatch({ type: 'SET_STEP', step });
  }, []);

  const setZipProgress = useCallback((value: number) => {
    dispatch({ type: 'SET_ZIP_PROGRESS', value });
  }, []);

  const setProcessing = useCallback((value: boolean) => {
    dispatch({ type: 'SET_PROCESSING', value });
  }, []);

  const resetAll = useCallback(() => {
    revokeBlobUrls(state.resultImages);
    dispatch({ type: 'RESET_ALL' });
  }, [state]);

  const processFiles = useCallback(
    async (settingsOverride?: Partial<MetadataSettings>): Promise<ProcessMetadataResults> => {
      const { sortedFiles, settings } = state;

      if (sortedFiles.length === 0) {
        return { images: [], errors: [] };
      }

      revokeBlobUrls(state.resultImages);
      dispatch({ type: 'PROCESS_START' });

      try {
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
          (completed: number) => dispatch({ type: 'PROCESS_PROGRESS', completed })
        );

        dispatch({ type: 'PROCESS_COMPLETE', images: results.images, errors: results.errors });
        return results;
      } catch (error) {
        console.error('Processing error:', error);
        const errors = [{ file: 'unknown', error: (error as Error).message }];
        dispatch({ type: 'PROCESS_ERROR', errors });
        return { images: [], errors };
      }
    },
    [state]
  );

  return {
    state,
    setFiles,
    setSettings,
    goToStep,
    setZipProgress,
    setProcessing,
    resetAll,
    processFiles,
  };
}
