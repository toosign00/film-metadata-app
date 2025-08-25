import type { NextConfig } from 'next';

const nextConfig = {
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  allowedDevOrigins: ['192.168.0.25', 'localhost', '127.0.0.1'],
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'sonner',
      'react-device-detect',
      '@radix-ui/react-alert-dialog',
      'date-fns',
    ],
  },
  async headers() {
    const oneYear = 'public, max-age=31536000, immutable';
    const security = [
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
      { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
    ];

    return [
      // 전역 보안 헤더
      { source: '/:path*', headers: security },
      {
        source: '/icons/:path*',
        headers: [{ key: 'Cache-Control', value: oneYear }],
      },
      {
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: oneYear }],
      },
      {
        source: '/fonts/:path*',
        headers: [{ key: 'Cache-Control', value: oneYear }],
      },
      {
        source: '/favicon.svg',
        headers: [{ key: 'Cache-Control', value: oneYear }],
      },
    ];
  },
} satisfies NextConfig;

export default nextConfig;
