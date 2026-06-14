'use client';

import { Download, Plus, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  deletePreset,
  exportPresets,
  getPresets,
  importPresets,
  savePreset,
} from '@/services/preset';
import type { Preset, PresetData } from '@/types/preset.types';

interface PresetBarProps {
  onLoad: (data: PresetData) => void;
  getCurrentData: () => PresetData;
}

export const PresetBar = ({ onLoad, getCurrentData }: PresetBarProps) => {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [saving, setSaving] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTriggerRef = useRef<HTMLButtonElement>(null);
  const presetButtonRefs = useRef(new Map<string, HTMLButtonElement>());

  useEffect(() => {
    setPresets(getPresets());
  }, []);

  const announce = useCallback((message: string) => {
    setStatusMessage('');
    requestAnimationFrame(() => setStatusMessage(message));
  }, []);

  const handleSave = useCallback(() => {
    const trimmed = presetName.trim();
    if (!trimmed) return;
    const data = getCurrentData();
    savePreset(trimmed, data);
    setPresets(getPresets());
    setPresetName('');
    setSaving(false);
    announce(`${trimmed} 프리셋을 저장했어요.`);
    requestAnimationFrame(() => saveTriggerRef.current?.focus());
  }, [presetName, getCurrentData, announce]);

  const handleDelete = useCallback(
    (id: string, index: number) => {
      const deletedPreset = presets[index];
      const focusId = presets[index + 1]?.id ?? presets[index - 1]?.id;
      deletePreset(id);
      const nextPresets = getPresets();
      setPresets(nextPresets);
      announce(`${deletedPreset.name} 프리셋을 삭제했어요.`);
      requestAnimationFrame(() => {
        const nextButton = focusId ? presetButtonRefs.current.get(focusId) : null;
        (nextButton ?? saveTriggerRef.current)?.focus();
      });
    },
    [presets, announce]
  );

  const handleLoad = useCallback(
    (preset: Preset) => {
      onLoad(preset.data);
      announce(`${preset.name} 프리셋을 불러왔어요.`);
    },
    [onLoad, announce]
  );

  const handleImport = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        await importPresets(file);
        setPresets(getPresets());
        announce('프리셋을 가져왔어요.');
      } catch {
        const message = '프리셋 파일을 불러오지 못했어요. 올바른 JSON 파일인지 확인해 주세요.';
        announce(message);
        alert(message);
      }
      e.target.value = '';
    },
    [announce]
  );

  const handleExport = useCallback(() => {
    announce(`${presets.length}개 프리셋을 내보냈어요.`);
    exportPresets();
  }, [presets.length, announce]);

  const closeSaving = useCallback(() => {
    setSaving(false);
    setPresetName('');
    requestAnimationFrame(() => saveTriggerRef.current?.focus());
  }, []);

  return (
    <div className='flex flex-col items-stretch gap-4 border-y border-border py-4 sm:flex-row sm:items-center sm:justify-between'>
      <div className='min-w-0'>
        <p className='text-xs font-semibold uppercase tracking-[0.04em] text-foreground'>Preset</p>
        <p className='mt-1 text-xs leading-5 text-foreground-muted'>
          자주 쓰는 카메라와 필름 설정을 저장해 바로 불러올 수 있어요.
        </p>
        <div className='mt-3 flex flex-wrap items-center gap-2'>
          {presets.length === 0 && (
            <p className='text-xs text-foreground-muted'>저장된 프리셋이 없어요.</p>
          )}
          {presets.map((preset, index) => (
            <span key={preset.id} className='inline-flex items-center md:group md:relative'>
              <button
                ref={(node) => {
                  if (node) {
                    presetButtonRefs.current.set(preset.id, node);
                  } else {
                    presetButtonRefs.current.delete(preset.id);
                  }
                }}
                type='button'
                onClick={() => handleLoad(preset)}
                data-preset-id={preset.id}
                className='min-h-9 cursor-pointer rounded-full border border-border bg-surface-alt px-3 text-xs text-foreground-secondary transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset'
                title={`${preset.name} 불러오기`}
              >
                <span className='block max-w-[10rem] truncate'>{preset.name}</span>
              </button>
              <button
                type='button'
                onClick={() => handleDelete(preset.id, index)}
                className='flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-[10px] bg-destructive/10 text-destructive transition-colors hover:bg-destructive/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset md:absolute md:-right-2 md:-top-2 md:h-6 md:w-6 md:rounded-full md:bg-destructive md:text-destructive-foreground md:opacity-0 md:shadow-sm md:transition-opacity md:group-hover:opacity-100 md:group-focus-within:opacity-100 md:focus-visible:opacity-100'
                aria-label={`${preset.name} 삭제`}
              >
                <X aria-hidden='true' size={12} />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className='flex flex-wrap items-center gap-2 sm:justify-end'>
        {saving ? (
          <>
            <input
              ref={inputRef}
              type='text'
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSave();
                }
                if (e.key === 'Escape') closeSaving();
              }}
              placeholder='이름 입력'
              maxLength={40}
              className='min-h-11 w-full rounded-[10px] border border-border bg-input px-3 text-sm text-foreground placeholder:text-foreground-muted/70 transition-colors hover:border-border-hover focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20 sm:w-36'
              aria-label='프리셋 이름'
            />
            <Button
              type='button'
              variant='secondary'
              onClick={handleSave}
              disabled={!presetName.trim()}
            >
              저장
            </Button>
            <Button
              type='button'
              variant='secondary'
              onClick={closeSaving}
              aria-label='취소'
              className='w-11 px-0'
            >
              <X aria-hidden='true' size={16} />
            </Button>
          </>
        ) : (
          <button
            ref={saveTriggerRef}
            type='button'
            onClick={() => {
              setSaving(true);
              requestAnimationFrame(() => inputRef.current?.focus());
            }}
            className='inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-border bg-surface px-5 text-sm font-semibold text-foreground-secondary transition-colors duration-150 hover:bg-surface-alt hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset'
          >
            <Plus aria-hidden='true' size={16} />
            저장
          </button>
        )}

        <input
          ref={fileInputRef}
          type='file'
          accept='.json'
          onChange={handleImport}
          className='hidden'
          tabIndex={-1}
        />
        <Button
          type='button'
          variant='secondary'
          onClick={() => fileInputRef.current?.click()}
          icon={<Upload aria-hidden='true' size={16} />}
        >
          가져오기
        </Button>
        <Button
          type='button'
          variant='secondary'
          onClick={handleExport}
          disabled={presets.length === 0}
          icon={<Download aria-hidden='true' size={16} />}
        >
          내보내기
        </Button>
      </div>
      <p className='sr-only' aria-live='polite'>
        {statusMessage}
      </p>
    </div>
  );
};
