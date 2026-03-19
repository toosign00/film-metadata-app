'use client';

import { Info, Plus, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPresets(getPresets());
  }, []);

  const handleSave = useCallback(() => {
    const trimmed = presetName.trim();
    if (!trimmed) return;
    const data = getCurrentData();
    savePreset(trimmed, data);
    setPresets(getPresets());
    setPresetName('');
    setSaving(false);
  }, [presetName, getCurrentData]);

  const handleDelete = useCallback((id: string) => {
    deletePreset(id);
    setPresets(getPresets());
  }, []);

  const handleLoad = useCallback(
    (preset: Preset) => {
      onLoad(preset.data);
    },
    [onLoad]
  );

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importPresets(file);
      setPresets(getPresets());
    } catch {
      alert('프리셋 파일을 불러올 수 없습니다. 올바른 JSON 파일인지 확인해주세요.');
    }
    e.target.value = '';
  }, []);

  return (
    <div className='flex flex-wrap items-center gap-2.5 border-border border-b pb-4'>
      <span className='group/info relative mr-1 inline-flex items-center gap-1 text-foreground-muted text-sm'>
        프리셋
        <Info size={14} className='cursor-help' />
        <span className='pointer-events-none absolute top-full left-0 z-20 mt-2 w-64 rounded-lg border border-border bg-surface p-3 text-foreground-secondary text-sm leading-relaxed opacity-0 shadow-lg transition-opacity group-hover/info:opacity-100'>
          자주 쓰는 카메라·렌즈·필름 설정을 프리셋으로 저장해두면 다음에 바로 불러올 수 있습니다.
          JSON 파일로 내보내거나 가져올 수도 있습니다.
        </span>
      </span>

      {presets.map((preset) => (
        <span key={preset.id} className='group relative'>
          <button
            type='button'
            onClick={() => handleLoad(preset)}
            className='cursor-pointer rounded-full border border-border bg-surface-alt px-3.5 py-1.5 text-foreground-secondary text-sm transition-colors hover:border-primary hover:text-primary'
            title={`${preset.name} 불러오기`}
          >
            {preset.name}
          </button>
          <button
            type='button'
            onClick={() => handleDelete(preset.id)}
            className='-top-1.5 -right-1.5 absolute flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100'
            aria-label={`${preset.name} 삭제`}
          >
            <X size={10} />
          </button>
        </span>
      ))}

      {saving ? (
        <div className='inline-flex items-center gap-2 rounded-full border border-primary/40 bg-surface-alt py-1.5 pr-2 pl-3.5'>
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
              if (e.key === 'Escape') setSaving(false);
            }}
            placeholder='이름 입력'
            className='w-24 bg-transparent text-foreground text-sm placeholder:text-foreground-muted focus:outline-none'
          />
          <button
            type='button'
            onClick={handleSave}
            disabled={!presetName.trim()}
            className='cursor-pointer rounded-full bg-primary px-3 py-1 font-medium text-primary-foreground text-xs transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50'
          >
            저장
          </button>
          <button
            type='button'
            onClick={() => {
              setSaving(false);
              setPresetName('');
            }}
            className='cursor-pointer rounded-full p-0.5 text-foreground-muted transition-colors hover:text-foreground'
            aria-label='취소'
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type='button'
          onClick={() => {
            setSaving(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
          className='inline-flex cursor-pointer items-center gap-1 rounded-full border border-dashed border-border-hover px-3.5 py-1.5 text-foreground-muted text-sm transition-colors hover:border-primary hover:text-primary'
          title='현재 설정을 프리셋으로 저장'
        >
          <Plus size={14} />새 프리셋
        </button>
      )}

      <span className='mx-0.5 h-5 w-px bg-border' />

      <input
        ref={fileInputRef}
        type='file'
        accept='.json'
        onChange={handleImport}
        className='hidden'
        tabIndex={-1}
      />
      <button
        type='button'
        onClick={() => fileInputRef.current?.click()}
        className='cursor-pointer text-foreground-muted text-sm transition-colors hover:text-foreground'
      >
        가져오기
      </button>
      <button
        type='button'
        onClick={exportPresets}
        disabled={presets.length === 0}
        className='cursor-pointer text-foreground-muted text-sm transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40'
      >
        내보내기
      </button>
    </div>
  );
};
