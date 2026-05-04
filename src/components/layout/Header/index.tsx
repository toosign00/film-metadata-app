'use client';

import { Check, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import type { HeaderProps } from '@/types/header.types';

const steps = [
  { number: 1, label: '파일 선택' },
  { number: 2, label: '메타데이터 설정' },
  { number: 3, label: '결과 확인' },
];

export const Header = ({
  className,
  activeStep,
  filesCount = 0,
  resultsCount = 0,
  processing = false,
  goToStep,
}: HeaderProps) => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isStepEnabled = (stepNumber: number) => {
    if (processing) return false;
    if (stepNumber === 1) return true;
    if (stepNumber === 2) return filesCount > 0;
    if (stepNumber === 3) return resultsCount > 0;
    return false;
  };

  const isStepCompleted = (stepNumber: number) => {
    if (activeStep === undefined) return false;
    return stepNumber < activeStep;
  };

  const showStepper = activeStep !== undefined && goToStep !== undefined;

  return (
    <header className={`border-b border-border bg-background ${className || ''}`}>
      <div className='mx-auto max-w-6xl px-6 py-6 md:px-8'>
        <div className='flex items-start justify-between'>
          <div>
            <h1 className='text-[22px] font-bold tracking-[-0.6px] text-foreground leading-tight'>
              필름 사진 메타데이터 설정 도구
            </h1>
            <p className='mt-1 text-sm text-foreground-muted'>
              스캔된 필름 사진에 EXIF 메타데이터를 일괄 설정합니다
            </p>
          </div>
          <div className='ml-4 flex shrink-0 items-center gap-2 mt-1'>
            {mounted ? (
              <button
                type='button'
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className='cursor-pointer rounded-md border border-border p-1.5 text-foreground-muted transition-colors hover:bg-surface-alt hover:text-foreground'
                aria-label={resolvedTheme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
              >
                {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            ) : (
              <div className='h-7.5 w-7.5 shrink-0' />
            )}
          </div>
        </div>

        {showStepper && (
          <div className='mt-6 flex items-center'>
            {steps.map((step, index) => {
              const enabled = isStepEnabled(step.number);
              const completed = isStepCompleted(step.number);
              const active = activeStep === step.number;

              return (
                <div
                  key={step.number}
                  className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
                >
                  <button
                    type='button'
                    onClick={() => enabled && goToStep(step.number)}
                    disabled={!enabled}
                    className={`flex shrink-0 items-center gap-2 ${enabled ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                    aria-current={active ? 'step' : undefined}
                  >
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                        completed
                          ? 'bg-primary text-primary-foreground'
                          : active
                            ? 'bg-foreground text-surface'
                            : 'border border-border-hover text-foreground-muted'
                      }`}
                    >
                      {completed ? <Check size={12} strokeWidth={3} /> : step.number}
                    </div>
                    <span
                      className={`hidden text-sm md:block ${
                        active
                          ? 'font-semibold text-foreground'
                          : completed
                            ? 'text-foreground-secondary'
                            : 'text-foreground-muted'
                      }`}
                    >
                      {step.label}
                    </span>
                  </button>

                  {index < steps.length - 1 && <div className='mx-4 h-px flex-1 bg-border' />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
