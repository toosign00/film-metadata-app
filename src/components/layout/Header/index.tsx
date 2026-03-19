'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import type { HeaderProps } from '@/types/header.types';

export const Header = ({ className }: HeaderProps) => {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className={`border-border border-b p-6 md:p-8 ${className || ''}`}>
      <div className='mx-auto flex max-w-6xl items-start justify-between'>
        <div>
          <h1 className='mb-2 font-bold text-2xl text-foreground md:text-3xl'>
            필름 사진 메타데이터 설정 도구
          </h1>
          <p className='text-foreground-secondary md:text-lg'>
            스캔된 필름 사진에 날짜 및 시간, 카메라, 렌즈, 필름 정보 등의 메타데이터를 일괄
            설정합니다.
          </p>
        </div>
        {mounted ? (
          <button
            type='button'
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className='ml-4 shrink-0 rounded-lg p-2 text-foreground-muted transition-colors hover:bg-surface hover:text-foreground cursor-pointer'
            aria-label={resolvedTheme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            {resolvedTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        ) : (
          <div className='ml-4 h-9 w-9 shrink-0' />
        )}
      </div>
    </header>
  );
};
