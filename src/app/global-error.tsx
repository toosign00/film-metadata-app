'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang='ko'>
      <body
        style={{
          margin: 0,
          background: '#fcfcfd',
          color: '#1d1d30',
          fontFamily: 'Pretendard, system-ui, sans-serif',
        }}
      >
        <main
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            padding: '24px',
          }}
        >
          <section
            style={{
              width: '100%',
              maxWidth: '448px',
              boxSizing: 'border-box',
              border: '1px solid #f4f4f8',
              borderRadius: '16px',
              background: '#ffffff',
              padding: '24px',
            }}
          >
            <h1 style={{ margin: 0, fontSize: '20px', lineHeight: 1.3 }}>문제가 생겼어요</h1>
            <p style={{ margin: '12px 0 20px', color: '#6b6b87', lineHeight: 1.7 }}>
              잠시 후 다시 시도해 주세요. 같은 문제가 계속되면 새로고침해 주세요.
            </p>
            <button
              type='button'
              onClick={reset}
              style={{
                minHeight: '44px',
                border: 0,
                borderRadius: '999px',
                background: '#3182f6',
                color: '#ffffff',
                padding: '0 20px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              다시 시도해요
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
