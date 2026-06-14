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
    <header className={`border-b border-border bg-background/95 ${className || ''}`}>
      <div className='mx-auto flex h-[58px] w-full max-w-6xl items-center justify-between px-4 sm:px-6'>
        <span className='text-xs font-semibold tracking-[0.08em] text-foreground'>
          Film Metadata
        </span>
        <div className='flex items-center'>
          {mounted ? (
            <button
              type='button'
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className='flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px] border border-border text-foreground-muted transition-colors hover:bg-surface-alt hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset'
              aria-label={resolvedTheme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
            >
              {resolvedTheme === 'dark' ? (
                <Sun aria-hidden='true' size={16} />
              ) : (
                <Moon aria-hidden='true' size={16} />
              )}
            </button>
          ) : (
            <div className='h-9 w-9 shrink-0' />
          )}
        </div>
      </div>
    </header>
  );
};
