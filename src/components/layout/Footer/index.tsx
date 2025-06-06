import React from 'react';
import { FooterProps } from '@/types/footer.type';

const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer className={`border-t border-gray-700 p-4 text-gray-400 text-sm bg-gray-900 ${className || ''}`}>
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-xs sm:text-base">
          이 도구는 이미지 파일의 EXIF 메타데이터를 브라우저에서 직접 설정합니다.
          <br />
          <span className="text-xs text-gray-500">파일은 서버로 업로드되지 않으며, 모든 처리는 브라우저에서만 이루어집니다.</span>
          <br />
        </p>
        <p className="mt-2 flex flex-row items-center justify-center gap-2">
          <span className="text-xs sm:text-sm text-gray-500">&copy; 2025. Hyunsoo Ro. All rights reserved.</span>
          <a className="text-xs sm:text-sm" href="mailto:kevinsoo1014@gmail.com?subject=문의드립니다.">
            kevinsoo1014@gmail.com
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
