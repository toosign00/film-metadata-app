/**
 * @fileoverview 레이아웃 컴포넌트 모음
 * 애플리케이션의 주요 레이아웃 구성요소들을 내보내는 인덱스 파일입니다.
 * 모든 레이아웃 관련 컴포넌트들은 이 파일을 통해 중앙 집중적으로 관리됩니다.
 */

/**
 * 이미지 처리 결과를 표시하는 뷰어 컴포넌트
 * @component
 */
export { default as ResultsViewer } from './ResultsViewer';

/**
 * 파일 선택 및 업로드를 처리하는 컴포넌트
 * @component
 */
export { default as FileSelection } from './FileSelection';

/**
 * 메타데이터 설정을 위한 폼 컴포넌트
 * @component
 */
export { default as MetadataSettings } from './MetadataSettings';

/**
 * 에러 상태를 표시하는 컴포넌트
 * @component
 */
export { default as ErrorDisplay } from './ErrorDisplay';

/**
 * 단계별 네비게이션을 제공하는 컴포넌트
 * @component
 */
export { default as StepNavigation } from './StepNavigation';

/**
 * 헤더 컴포넌트
 * @component
 */
export { default as Header } from './Header';

/**
 * 푸터 컴포넌트
 * @component
 */
export { default as Footer } from './Footer';

/**
 * 모바일 접근 제한 메시지 컴포넌트
 * @component
 */
export { default as MobileWarning } from './MobileWarning';

/**
 * 단계 관리 컴포넌트
 * @component
 */
export { default as StepManager } from './StepManager';

/**
 * 메인 레이아웃 컴포넌트
 * @component
 */
export { default as MainLayout } from './MainLayout';
