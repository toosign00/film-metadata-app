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
      alert('프리셋 파일을 불러오지 못했어요. 올바른 JSON 파일인지 확인해 주세요.');
    }
    e.target.value = '';
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
          {presets.map((preset) => (
            <span key={preset.id} className='group relative'>
              <button
                type='button'
                onClick={() => handleLoad(preset)}
                className='min-h-9 cursor-pointer rounded-full border border-border bg-surface-alt px-3 text-xs text-foreground-secondary transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset'
                title={`${preset.name} 불러오기`}
              >
                {preset.name}
              </button>
              <button
                type='button'
                onClick={() => handleDelete(preset.id)}
                className='-right-2 -top-2 absolute flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset'
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
                if (e.key === 'Escape') setSaving(false);
              }}
              placeholder='이름 입력'
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
              onClick={() => {
                setSaving(false);
                setPresetName('');
              }}
              aria-label='취소'
              className='w-11 px-0'
            >
              <X aria-hidden='true' size={16} />
            </Button>
          </>
        ) : (
          <Button
            type='button'
            variant='secondary'
            onClick={() => {
              setSaving(true);
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
            icon={<Plus aria-hidden='true' size={16} />}
          >
            저장
          </Button>
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
          onClick={exportPresets}
          disabled={presets.length === 0}
          icon={<Download aria-hidden='true' size={16} />}
        >
          내보내기
        </Button>
      </div>
    </div>
  );
};
