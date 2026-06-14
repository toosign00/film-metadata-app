'use client';

import { Toaster } from 'sonner';

export function ToasterClient() {
  return (
    <Toaster
      toastOptions={{
        style: {
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--foreground)',
        },
      }}
    />
  );
}
