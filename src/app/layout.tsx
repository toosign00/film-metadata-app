import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import '@/styles/globals.css';
import 'react-datepicker/dist/react-datepicker.css';
import '@/styles/datepicker.css';

const pretendard = localFont({
  src: [{ path: '../../public/fonts/PretendardVariable.woff2', weight: '45 920', style: 'normal' }],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
  fallback: [
    'system-ui',
    '-apple-system',
    'Segoe UI',
    'Apple SD Gothic Neo',
    'Malgun Gothic',
    'sans-serif',
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://film-metadata.vercel.app'),
  title: {
    default: 'Film Metadata Settings App',
    template: '%s | Film Metadata Settings App',
  },
  description: '필름 사진의 EXIF 메타데이터를 손쉽게 편집, 다운로드할 수 있는 웹 도구',
  keywords: [
    'film',
    'metadata',
    'exif',
    'photo',
    '이미지 메타데이터',
    '필름 사진',
    '무료 메타데이터 도구',
    '필름 메타데이터 편집',
    '필름 메타데이터 다운로드',
    '필름 메타데이터 편집기',
    '필름 메타데이터 다운로더',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: 'https://film-metadata.vercel.app/',
    siteName: 'Film Metadata Settings App',
    title: 'Film Metadata Settings App',
    description: '필름 사진의 EXIF 메타데이터를 손쉽게 편집, 다운로드할 수 있는 웹 도구',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Film Metadata Settings App',
      },
    ],
    locale: 'ko',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Film Metadata Settings App',
    description: '필름 사진의 EXIF 메타데이터를 손쉽게 편집, 다운로드할 수 있는 웹 도구',
    images: ['/images/og-twitter-image.png'],
    creator: '@toosign00',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
    apple: [
      { url: '/icons/apple-touch-icon-120x120.png', sizes: '120x120' },
      { url: '/icons/apple-touch-icon-152x152.png', sizes: '152x152' },
      { url: '/icons/apple-touch-icon-167x167.png', sizes: '167x167' },
      { url: '/icons/apple-touch-icon-180x180.png', sizes: '180x180' },
    ],
  },
  category: 'technology',
};

export const viewport: Viewport = {
  themeColor: '#101828',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='ko'>
      <body className={pretendard.variable}>
        {/* Structured Data */}
        <Script id='ld-software' type='application/ld+json' strategy='afterInteractive'>
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Film Metadata Settings App',
            applicationCategory: 'MultimediaApplication',
            operatingSystem: 'Web',
            url: 'https://film-metadata.vercel.app',
            description: '필름 사진의 EXIF 메타데이터를 손쉽게 편집, 다운로드할 수 있는 웹 도구',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'KRW',
            },
          })}
        </Script>
        <div className='flex min-h-screen w-full flex-col overflow-x-hidden bg-gray-900 text-gray-200'>
          <Header />
          <main className='flex-1 overflow-auto p-6 md:p-8'>
            <div className='mx-auto w-full max-w-6xl'>{children}</div>
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
