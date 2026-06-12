# Film Metadata Design Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `DESIGN.md`와 `my-blog`의 시각 언어를 공유하면서도 3단계 작업 흐름에 집중하는 Film Metadata UI로 전면 개편한다.

**Architecture:** 기존 `useAppReducer`, React Hook Form, 메타데이터 처리 및 다운로드 서비스는 유지한다. 전역 토큰과 공통 화면 뼈대를 먼저 교체하고, `StepNavigation`, `StepIntro`, `FileSummary`, `MetadataCard`처럼 반복되는 표현 경계만 추가한 뒤 각 단계 화면을 순서대로 재구성한다.

**Tech Stack:** Next.js 16, React 19, TypeScript 6, Tailwind CSS v4, next-themes, React Hook Form, react-datepicker, Lucide React

---

## 실행 원칙

- 기준 브랜치는 `develop`, 작업 브랜치는 현재 checkout된 `feature/design-overhaul`이다.
- 상태 관리, 파일 처리, EXIF 처리, 프리셋 저장 형식, 다운로드 서비스는 변경하지 않는다.
- 새 상태 관리 또는 UI 라이브러리를 설치하지 않는다.
- 저장소에는 단위 테스트 러너가 없으므로 스타일 변경을 위해 새 테스트 프레임워크를 추가하지 않는다.
- 각 작업은 `pnpm check`로 검증한다.
- UI 상태는 마지막 작업에서 인앱 브라우저로 직접 검증한다.
- 사용자의 요청에 따라 `pnpm build`는 실행하지 않는다.
- UI 문구는 영문 구조 라벨과 자연스러운 한국어 `~해요`, `~예요` 말투를 사용한다.

## 파일 구조

### 새 파일

| 파일 | 책임 |
| --- | --- |
| `src/components/layout/StepNavigation/index.tsx` | 단계 활성·완료·비활성 상태와 이동 가능 조건 표현 |
| `src/components/layout/StepIntro/index.tsx` | 단계 라벨, 제목, 설명의 공통 위계 |
| `src/components/ui/FileSummary/index.tsx` | 선택 파일 수, 총용량, 지원 형식 요약 |
| `src/components/ui/MetadataCard/index.tsx` | 메타데이터 카드의 공통 제목·설명·fieldset 표면 |
| `src/types/stepNavigation.types.ts` | 진행 내비게이션 props |
| `src/types/stepIntro.types.ts` | 단계 인트로 props |
| `src/types/fileSummary.types.ts` | 파일 요약 props |
| `src/types/metadataCard.types.ts` | 메타데이터 카드 props |

### 주요 수정 파일

| 영역 | 파일 |
| --- | --- |
| 전역 토큰 | `src/styles/globals.css`, `src/styles/datepicker.css`, `src/app/layout.tsx` |
| 공통 뼈대 | `src/app/page.tsx`, `src/components/layout/Header/index.tsx`, `src/types/header.types.ts` |
| 공통 UI | `src/components/ui/Button/index.tsx`, `src/types/button.types.ts`, `src/components/ui/CustomDatePicker/index.tsx` |
| 파일 선택 | `src/components/layout/FileSelection/index.tsx`, `src/components/ui/DropZone/index.tsx`, `src/components/ui/FileList/index.tsx` |
| 메타데이터 | `src/components/layout/MetadataSettings/index.tsx`, `src/components/layout/MetadataSettings/components/*.tsx` |
| 결과 | `src/components/layout/ResultsViewer/index.tsx`, `src/components/ui/ImageCard/index.tsx`, `src/components/ui/ProgressBar/index.tsx`, `src/components/layout/ErrorDisplay/index.tsx` |
| 보조 화면 | `src/components/layout/Footer/index.tsx`, `src/app/error.tsx`, `src/app/global-error.tsx`, `src/app/loading.tsx`, `src/app/not-found.tsx` |

---

### Task 1: 전역 디자인 토큰과 기본 캔버스 교체

**Files:**
- Modify: `src/styles/globals.css:1-140`
- Modify: `src/styles/datepicker.css:14-145`
- Modify: `src/app/layout.tsx:97-123`

- [ ] **Step 1: 현재 기준 검사 실행**

Run:

```bash
pnpm check
```

Expected: `Checked 67 files`와 `tsc --noEmit`이 오류 없이 종료된다.

- [ ] **Step 2: Tailwind 토큰을 새 라이트·다크 팔레트로 교체**

`src/styles/globals.css`의 `@theme inline`, `:root`, `[data-theme="dark"]`를 다음 계약으로 갱신한다.

```css
@theme inline {
  --color-background: var(--background);
  --color-surface: var(--surface);
  --color-surface-alt: var(--surface-alt);
  --color-input: var(--input);
  --color-muted: var(--muted);
  --color-overlay: var(--overlay);
  --color-foreground: var(--foreground);
  --color-foreground-secondary: var(--foreground-secondary);
  --color-foreground-muted: var(--foreground-muted);
  --color-border: var(--border);
  --color-border-hover: var(--border-hover);
  --color-primary: var(--primary);
  --color-primary-hover: var(--primary-hover);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary-muted: var(--primary-muted);
  --color-destructive: var(--destructive);
  --color-destructive-hover: var(--destructive-hover);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-destructive-bg: var(--destructive-bg);
  --color-destructive-border: var(--destructive-border);
  --color-destructive-muted: var(--destructive-muted);
  --color-ring: var(--ring);
  --color-ring-offset: var(--ring-offset);

  --radius-card: 1rem;
  --radius-control: 0.625rem;
}

:root {
  --background: #fcfcfd;
  --surface: #ffffff;
  --surface-alt: #f9f9fc;
  --input: #ffffff;
  --muted: #f4f4f8;
  --overlay: rgba(15, 15, 15, 0.35);
  --foreground: #1d1d30;
  --foreground-secondary: #393960;
  --foreground-muted: #6b6b87;
  --border: #f4f4f8;
  --border-hover: #d9dbe7;
  --primary: #3182f6;
  --primary-hover: #2878eb;
  --primary-foreground: #ffffff;
  --primary-muted: #63a9ff;
  --destructive: #dc2626;
  --destructive-hover: #b91c1c;
  --destructive-foreground: #ffffff;
  --destructive-bg: rgba(220, 38, 38, 0.06);
  --destructive-border: rgba(220, 38, 38, 0.18);
  --destructive-muted: #b91c1c;
  --ring: #2997ff;
  --ring-offset: #fcfcfd;
}

[data-theme="dark"] {
  --background: #0f0f0f;
  --surface: #101010;
  --surface-alt: #141414;
  --input: #101010;
  --muted: #1b1b1b;
  --overlay: rgba(0, 0, 0, 0.5);
  --foreground: #ffffff;
  --foreground-secondary: #dddddd;
  --foreground-muted: #b2b2b2;
  --border: #1b1b1b;
  --border-hover: #36363a;
  --primary: #63a9ff;
  --primary-hover: #8ec2ff;
  --primary-foreground: #0f0f0f;
  --primary-muted: #8ec2ff;
  --destructive: #ef4444;
  --destructive-hover: #f87171;
  --destructive-foreground: #ffffff;
  --destructive-bg: rgba(239, 68, 68, 0.08);
  --destructive-border: rgba(239, 68, 68, 0.22);
  --destructive-muted: #fca5a5;
  --ring: #8ec2ff;
  --ring-offset: #0f0f0f;
}
```

`body`에는 `word-break: keep-all`을 추가하고 기본 배경과 텍스트가 토큰을 따르게 한다. 공통 단계 전환 클래스를 추가한다.

```css
@layer utilities {
  .step-enter {
    animation: step-enter 200ms ease-out both;
  }
}

@keyframes step-enter {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .step-enter {
    animation: none;
  }
}
```

- [ ] **Step 3: datepicker가 새 토큰과 포커스 계약을 사용하도록 수정**

`src/styles/datepicker.css`에서 전역 `button:focus { outline: none !important; }` 규칙을 제거한다. 달력 표면은 `var(--color-surface)`, 헤더와 hover는 `var(--color-surface-alt)`, 선택 상태는 `var(--color-primary)`를 사용한다. 팝오버 반경은 `0.75rem`, 그림자는 `0 18px 40px rgba(0, 0, 0, 0.12)` 하나만 사용한다.

- [ ] **Step 4: viewport와 루트 캔버스를 갱신**

`src/app/layout.tsx`에서 `themeColor`을 라이트·다크 배열로 바꾸고 루트 wrapper에서 불필요한 색상 클래스를 제거한다.

```tsx
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fcfcfd' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0f0f' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

<div className='flex min-h-screen w-full flex-col overflow-x-hidden'>
  {children}
  <Footer />
  <ToasterClient />
</div>
```

- [ ] **Step 5: 검사 후 커밋**

Run:

```bash
pnpm check
```

Expected: Biome 수정 없음, TypeScript 오류 없음.

Commit:

```bash
git add src/styles/globals.css src/styles/datepicker.css src/app/layout.tsx
git commit -m "style: 브랜드 디자인 토큰과 캔버스 개편"
```

---

### Task 2: Header, StepNavigation, StepIntro로 공통 화면 뼈대 분리

**Files:**
- Create: `src/components/layout/StepNavigation/index.tsx`
- Create: `src/components/layout/StepIntro/index.tsx`
- Create: `src/types/stepNavigation.types.ts`
- Create: `src/types/stepIntro.types.ts`
- Modify: `src/components/layout/Header/index.tsx:1-124`
- Modify: `src/types/header.types.ts:1-8`
- Modify: `src/app/page.tsx:39-87`

- [ ] **Step 1: 진행 내비게이션 타입과 컴포넌트 작성**

`src/types/stepNavigation.types.ts`:

```ts
export interface StepNavigationProps {
  activeStep: number;
  filesCount: number;
  resultsCount: number;
  processing: boolean;
  goToStep: (step: number) => void;
}
```

`src/components/layout/StepNavigation/index.tsx`는 다음 상태 판정만 소유한다.

```tsx
import { Check } from 'lucide-react';
import type { StepNavigationProps } from '@/types/stepNavigation.types';

const steps = [
  { number: 1, label: 'Select' },
  { number: 2, label: 'Metadata' },
  { number: 3, label: 'Export' },
];

export const StepNavigation = ({
  activeStep,
  filesCount,
  resultsCount,
  processing,
  goToStep,
}: StepNavigationProps) => {
  const isEnabled = (step: number) => {
    if (processing) return false;
    if (step === 1) return true;
    if (step === 2) return filesCount > 0;
    return resultsCount > 0;
  };

  return (
    <nav aria-label='작업 진행 단계' className='border-b border-border'>
      <ol className='mx-auto flex h-14 w-full max-w-5xl items-center px-4 sm:px-6'>
        {steps.map((step, index) => {
          const active = activeStep === step.number;
          const complete = step.number < activeStep;
          const enabled = isEnabled(step.number);

          return (
            <li
              key={step.number}
              className={`flex min-w-0 items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
            >
              <button
                type='button'
                disabled={!enabled}
                onClick={() => goToStep(step.number)}
                aria-current={active ? 'step' : undefined}
                className='group flex min-h-11 shrink-0 items-center gap-2 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
              >
                <span
                  className={[
                    'grid h-6 w-6 place-items-center rounded-full border text-[10px] font-semibold',
                    complete && 'border-primary bg-primary text-primary-foreground',
                    active && 'border-foreground bg-foreground text-background',
                    !complete && !active && 'border-border-hover text-foreground-muted',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {complete ? <Check size={12} aria-hidden /> : String(step.number).padStart(2, '0')}
                </span>
                <span
                  className={`hidden text-xs font-medium sm:inline ${
                    active ? 'text-foreground' : 'text-foreground-muted'
                  }`}
                >
                  {step.label}
                </span>
              </button>
              {index < steps.length - 1 && (
                <span
                  aria-hidden
                  className={`mx-3 h-px min-w-3 flex-1 sm:mx-5 ${
                    complete ? 'bg-primary/50' : 'bg-border'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
```

- [ ] **Step 2: 단계 인트로 작성**

`src/types/stepIntro.types.ts`:

```ts
import type { ReactNode } from 'react';

export interface StepIntroProps {
  eyebrow: string;
  title: string;
  description: ReactNode;
  titleId: string;
}
```

`src/components/layout/StepIntro/index.tsx`:

```tsx
import type { StepIntroProps } from '@/types/stepIntro.types';

export const StepIntro = ({ eyebrow, title, description, titleId }: StepIntroProps) => (
  <header className='mb-8 md:mb-10'>
    <p className='text-[11px] font-semibold tracking-[0.12em] text-primary'>{eyebrow}</p>
    <h1
      id={titleId}
      className='mt-3 text-[28px] font-semibold leading-[1.18] tracking-[-0.035em] text-foreground md:text-[34px]'
    >
      {title}
    </h1>
    <div className='mt-3 max-w-2xl text-sm leading-7 text-foreground-muted'>{description}</div>
  </header>
);
```

- [ ] **Step 3: Header를 브랜드와 테마 전환만 담당하도록 축소**

`HeaderProps`는 `className`만 유지한다.

```ts
export interface HeaderProps {
  className?: string;
}
```

Header의 렌더 구조는 다음으로 교체한다.

```tsx
<header className={`border-b border-border bg-background/95 ${className ?? ''}`}>
  <div className='mx-auto flex h-[58px] w-full max-w-5xl items-center justify-between px-4 sm:px-6'>
    <span className='text-xs font-semibold tracking-[0.08em] text-foreground'>
      Film Metadata
    </span>
    <div className='flex items-center gap-3'>
      <span className='hidden text-[11px] text-foreground-muted md:inline'>
        파일은 브라우저에서 안전하게 처리해요
      </span>
      {/* 기존 mounted 처리와 next-themes 토글을 유지 */}
    </div>
  </div>
</header>
```

테마 버튼은 `h-11 w-11 md:h-9 md:w-9`, `rounded-[10px]`, 헤어라인, 포커스 링을 사용한다.

- [ ] **Step 4: page에 Header와 StepNavigation을 조립**

`src/app/page.tsx`의 최상위 구조를 다음 순서로 바꾼다.

```tsx
<>
  <Header />
  <StepNavigation
    activeStep={state.activeStep}
    filesCount={state.files.length}
    resultsCount={state.resultImages.length}
    processing={state.processing}
    goToStep={goToStep}
  />
  <main className='flex-1'>
    <div className='mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 md:py-14'>
      <div key={state.activeStep} className='step-enter'>
        {/* 기존 조건부 단계 렌더링 */}
      </div>
    </div>
  </main>
</>
```

- [ ] **Step 5: 검사 후 커밋**

Run:

```bash
pnpm check
```

Commit:

```bash
git add src/app/page.tsx src/components/layout/Header src/components/layout/StepNavigation src/components/layout/StepIntro src/types/header.types.ts src/types/stepNavigation.types.ts src/types/stepIntro.types.ts
git commit -m "refactor: 공통 헤더와 단계 내비게이션 분리"
```

---

### Task 3: Button과 입력·피드백 표면의 공통 스타일 정리

**Files:**
- Modify: `src/components/ui/Button/index.tsx:1-55`
- Modify: `src/types/button.types.ts:1-13`
- Modify: `src/components/ui/CustomDatePicker/index.tsx:1-45`
- Modify: `src/components/ui/ProgressBar/index.tsx:1-25`
- Modify: `src/components/layout/ErrorDisplay/index.tsx:1-27`
- Modify: `src/components/ui/AlertDialog/index.tsx:1-63`
- Modify: `src/components/ui/Toaster/index.tsx:1-7`

- [ ] **Step 1: Button 변형 계약을 명확히 수정**

`ButtonVariant`는 `primary | secondary | text | destructive`로 정리한다.

```ts
export type ButtonVariant = 'primary' | 'secondary' | 'text' | 'destructive';
```

Button 스타일 맵:

```tsx
const styles = {
  base: 'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 px-5 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-ring-offset',
  primary: 'rounded-full bg-primary text-primary-foreground hover:bg-primary-hover',
  secondary:
    'rounded-[10px] border border-border bg-surface text-foreground-secondary hover:bg-surface-alt hover:text-foreground',
  text: 'rounded-[10px] px-3 text-foreground-muted hover:bg-surface-alt hover:text-foreground',
  destructive:
    'rounded-[10px] bg-destructive text-destructive-foreground hover:bg-destructive-hover',
  disabled: 'pointer-events-none cursor-not-allowed opacity-40',
  loading: 'cursor-wait',
};
```

아이콘 wrapper의 중복 margin을 제거하고 `aria-hidden`은 호출자가 아이콘에 부여한다. 로딩 문구는 `처리하고 있어요...`로 바꾼다.

- [ ] **Step 2: DatePicker 입력 표면을 일반 입력과 통일**

CustomInput wrapper는 `min-h-11 rounded-[10px] border border-border bg-input px-3`, hover 시 `border-border-hover`, `focus-visible`과 `focus-within`에서 ring을 사용한다. `role='button'`과 키보드 Enter/Space 동작은 유지한다.

- [ ] **Step 3: ProgressBar와 ErrorDisplay에서 그림자를 제거**

ProgressBar는 배경 카드 대신 얇은 상태 영역으로 바꾼다.

```tsx
<div className={`mb-6 border-y border-border py-4 ${className}`} aria-live='polite'>
  <div className='mb-2 flex items-center justify-between text-xs'>
    <span className='font-medium text-foreground-secondary'>{label}</span>
    <span className='text-foreground-muted'>{progress}%</span>
  </div>
  <div className='h-1.5 overflow-hidden rounded-full bg-muted'>
    <div className='h-full rounded-full bg-primary transition-[width] duration-300' />
  </div>
</div>
```

ErrorDisplay는 `role='status'`, 헤어라인, destructive tint를 사용하고 제목을 `처리하지 못한 파일 {n}개`로 바꾼다. 파일명은 `font-medium`, 원인은 별도 span으로 구분한다.

- [ ] **Step 4: Dialog와 Toaster 토큰 정리**

AlertDialog는 `rounded-2xl`, 단일 헤어라인, 44px 높이, 자연스러운 한국어 문구를 사용한다. Radix `asChild`의 ref 요구사항 때문에 현재 `Button`을 억지로 감싸지 않고, 두 native button에 공통 Button 스타일 계약을 그대로 적용한다. `transition-all`, `shadow-lg`, `backdrop-blur-sm`은 제거한다.

```tsx
<AlertDialog.Content className='fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-5 rounded-2xl border border-border bg-surface p-5 sm:p-6'>
  <div className='space-y-2'>
    <AlertDialog.Title className='text-lg font-semibold text-foreground'>
      {title}
    </AlertDialog.Title>
    <AlertDialog.Description className='text-sm leading-6 text-foreground-muted'>
      {description}
    </AlertDialog.Description>
  </div>
  <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
    <AlertDialog.Cancel asChild>
      <button className='min-h-11 rounded-[10px] border border-border bg-surface px-5 text-sm font-semibold text-foreground-secondary hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
        {cancelText}
      </button>
    </AlertDialog.Cancel>
    <AlertDialog.Action asChild>
      <button className='min-h-11 rounded-[10px] bg-destructive px-5 text-sm font-semibold text-destructive-foreground hover:bg-destructive-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive-muted'>
        {confirmText}
      </button>
    </AlertDialog.Action>
  </div>
</AlertDialog.Content>
```

기존 `handleConfirm`, `handleCancel`, controlled open 상태, trigger 동작은 유지한다. Toaster에는 전역 토큰을 전달한다.

```tsx
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
```

- [ ] **Step 5: 검사 후 커밋**

Run:

```bash
pnpm check
```

Commit:

```bash
git add src/components/ui/Button src/types/button.types.ts src/components/ui/CustomDatePicker src/components/ui/ProgressBar src/components/layout/ErrorDisplay src/components/ui/AlertDialog src/components/ui/Toaster
git commit -m "style: 공통 컨트롤과 피드백 표면 통일"
```

---

### Task 4: 파일 선택 단계를 업로드·목록·요약 구조로 개편

**Files:**
- Create: `src/components/ui/FileSummary/index.tsx`
- Create: `src/types/fileSummary.types.ts`
- Modify: `src/components/layout/FileSelection/index.tsx:1-55`
- Modify: `src/components/ui/DropZone/index.tsx:1-95`
- Modify: `src/components/ui/FileList/index.tsx:1-39`

- [ ] **Step 1: FileSummary 작성**

`src/types/fileSummary.types.ts`:

```ts
export interface FileSummaryProps {
  files: File[];
}
```

`src/components/ui/FileSummary/index.tsx`:

```tsx
import type { FileSummaryProps } from '@/types/fileSummary.types';

export const FileSummary = ({ files }: FileSummaryProps) => {
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  const totalMegabytes = totalBytes / 1024 / 1024;

  return (
    <dl className='mt-4 flex flex-wrap gap-2' aria-label='선택 파일 요약'>
      <div className='rounded-full border border-border bg-surface px-3 py-1.5 text-xs'>
        <dt className='sr-only'>파일 수</dt>
        <dd className='text-foreground-secondary'>{files.length} files</dd>
      </div>
      <div className='rounded-full border border-border bg-surface px-3 py-1.5 text-xs'>
        <dt className='sr-only'>전체 용량</dt>
        <dd className='text-foreground-secondary'>{totalMegabytes.toFixed(1)} MB</dd>
      </div>
      <div className='rounded-full border border-border bg-surface px-3 py-1.5 text-xs'>
        <dt className='sr-only'>지원 형식</dt>
        <dd className='text-foreground-secondary'>JPG / JPEG</dd>
      </div>
    </dl>
  );
};
```

- [ ] **Step 2: DropZone 문구와 상태 스타일 수정**

핵심 문구:

- 기본: `이미지를 끌어놓거나 파일을 선택해요`
- 선택 후: `{n}개 파일을 선택했어요`
- 드래그 중: `여기에 놓아주세요`
- 안내: `파일당 최대 15MB · 최대 {maxFiles}개`

DropZone은 `min-h-[280px] rounded-2xl`, 기본 `border-border-hover`, drag 상태 `border-primary bg-primary/5`, 선택 상태 `border-primary/30`을 사용한다. `ImageUp` 아이콘은 32px로 줄이고 버튼 전체에 `focus-visible:ring-2`를 추가한다. hook destructuring에 `errors`, `clearErrors`, `maxFiles`를 추가하고 파일 대화상자를 열기 직전에 `clearErrors()`를 호출한다.

button 아래에 다음 오류 목록을 형제 요소로 렌더링할 수 있도록 최상위를 `<div>`로 감싼다. 오류 영역은 button 내부에 넣지 않는다.

```tsx
{errors.length > 0 && (
  <ul className='mt-3 space-y-1 text-xs text-destructive-muted' aria-live='polite'>
    {errors.map((error) => (
      <li key={error}>{error}</li>
    ))}
  </ul>
)}
```

검증 오류 문구는 `지원하지 않는 파일이에요: {name}`, `파일 크기는 최대 15MB예요: {name}`, `파일은 최대 {maxFiles}개까지 선택할 수 있어요.`로 `useFileDrop`에서 함께 수정한다.

- [ ] **Step 3: FileList를 헤어라인 목록으로 수정**

FileList는 300px 고정 inline style 대신 `min-h-[280px] max-h-[360px]` 클래스를 사용한다. 각 행의 회색 배경을 제거하고 `border-b border-border last:border-0`로 처리한다. 헤더 라벨은 `Selected files`, 파일 개수는 pill로 표시한다.

- [ ] **Step 4: FileSelection에 StepIntro와 FileSummary 조립**

```tsx
<section aria-labelledby='file-section'>
  <StepIntro
    eyebrow='01 / SELECT'
    title='이미지를 선택하세요'
    titleId='file-section'
    description={
      <p>JPG 또는 JPEG 파일을 선택하면 촬영 순서대로 정렬해요.</p>
    }
  />
  <div className='grid gap-4 md:grid-cols-[1.2fr_0.8fr]'>
    <DropZone onFileSelect={onFileSelect} filesCount={sortedFiles.length} />
    <FileList files={sortedFiles} />
  </div>
  <FileSummary files={sortedFiles} />
  <div className='mt-8 flex justify-end'>
    <Button disabled={sortedFiles.length === 0} onClick={() => goToStep(2)}>
      다음 단계 →
    </Button>
  </div>
</section>
```

파일이 없을 때도 FileList 자리에는 `파일을 선택하면 처리 순서를 보여드려요` 빈 상태를 렌더링해 레이아웃 높이를 유지한다.

- [ ] **Step 5: 검사 후 커밋**

Run:

```bash
pnpm check
```

Commit:

```bash
git add src/components/layout/FileSelection src/components/ui/DropZone src/components/ui/FileList src/components/ui/FileSummary src/types/fileSummary.types.ts
git commit -m "style: 파일 선택 화면을 목록과 요약 중심으로 개편"
```

---

### Task 5: 메타데이터 설정을 균등 카드 그리드로 개편

**Files:**
- Create: `src/components/ui/MetadataCard/index.tsx`
- Create: `src/types/metadataCard.types.ts`
- Modify: `src/components/layout/MetadataSettings/index.tsx:1-126`
- Modify: `src/components/layout/MetadataSettings/components/CameraSection.tsx:1-74`
- Modify: `src/components/layout/MetadataSettings/components/DateTimeSection.tsx:1-79`
- Modify: `src/components/layout/MetadataSettings/components/LensSection.tsx:1-102`
- Modify: `src/components/layout/MetadataSettings/components/FilmSection.tsx:1-74`
- Modify: `src/components/layout/MetadataSettings/components/PresetBar.tsx:1-176`

- [ ] **Step 1: MetadataCard 공통 표면 작성**

`src/types/metadataCard.types.ts`:

```ts
import type { ReactNode } from 'react';

export interface MetadataCardProps {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}
```

`src/components/ui/MetadataCard/index.tsx`:

```tsx
import type { MetadataCardProps } from '@/types/metadataCard.types';

export const MetadataCard = ({
  id,
  eyebrow,
  title,
  description,
  children,
}: MetadataCardProps) => (
  <fieldset
    aria-labelledby={`${id}-title`}
    className='rounded-2xl border border-border bg-surface p-5 md:p-6'
  >
    <legend className='sr-only'>{title}</legend>
    <p className='text-[10px] font-semibold tracking-[0.1em] text-primary'>{eyebrow}</p>
    <h2 id={`${id}-title`} className='mt-2 text-[15px] font-semibold text-foreground'>
      {title}
    </h2>
    <p className='mt-1.5 text-xs leading-5 text-foreground-muted'>{description}</p>
    <div className='mt-5'>{children}</div>
  </fieldset>
);
```

- [ ] **Step 2: 네 section을 MetadataCard로 감싸고 문구 통일**

카드 계약:

```tsx
<MetadataCard
  id='capture'
  eyebrow='01 / CAPTURE'
  title='날짜 및 시간'
  description='첫 사진의 촬영 시점을 기준으로 기록해요.'
>
  {/* 기존 Controller 필드 */}
</MetadataCard>
```

나머지는 다음 텍스트를 사용한다.

- Camera: `02 / CAMERA`, `카메라`, `카메라 제조사와 모델을 기록해요.`
- Lens: `03 / LENS`, `렌즈`, `렌즈와 촬영 설정을 입력해요.`
- Film: `04 / FILM`, `필름`, `필름 종류와 감도를 입력해요.`

모든 input 클래스는 다음 계약으로 통일한다.

```txt
min-h-11 w-full rounded-[10px] border border-border bg-input px-3 text-sm
text-foreground placeholder:text-foreground-muted/70 transition-colors
hover:border-border-hover focus:border-ring focus:outline-none focus:ring-2
focus:ring-ring/20
```

도움말은 `~입력하세요` 대신 `~을 기록해요` 말투로 바꾼다. 오류 메시지의 `role='alert'`, `aria-invalid`, `aria-describedby`는 유지한다.

- [ ] **Step 3: PresetBar를 상단 유틸리티 바로 재배치**

최상위 구조를 `border-y border-border py-4`로 바꾸고 왼쪽에는 `Preset`과 현재 상태를 표시한다. 오른쪽에는 저장, 가져오기, 내보내기를 44px 터치 영역의 secondary 버튼으로 배치한다. 기존 저장·삭제·불러오기 동작과 hidden JSON input은 유지한다.

프리셋 도움말:

```txt
자주 쓰는 카메라와 필름 설정을 저장해 바로 불러올 수 있어요.
```

import 실패 alert:

```txt
프리셋 파일을 불러오지 못했어요. 올바른 JSON 파일인지 확인해 주세요.
```

- [ ] **Step 4: MetadataSettingsForm에서 큰 외부 카드 제거**

```tsx
<section aria-labelledby='metadata-section'>
  <StepIntro
    eyebrow='02 / METADATA'
    title='촬영 정보를 입력하세요'
    titleId='metadata-section'
    description={<p>선택한 모든 이미지에 같은 EXIF 정보를 적용해요.</p>}
  />
  <form ref={formRef} onSubmit={handleSubmit(...)} noValidate>
    <PresetBar onLoad={handlePresetLoad} getCurrentData={getCurrentPresetData} />
    <div className='mt-6 grid grid-cols-1 gap-4 md:grid-cols-2'>
      <DateTimeSection control={control} errors={errors} />
      <CameraSection register={register} errors={errors} />
      <LensSection register={register} errors={errors} />
      <FilmSection register={register} errors={errors} />
    </div>
    <div className='mt-8 flex items-center justify-between gap-4'>
      <Button variant='text' type='button' onClick={() => goToStep(1)}>
        ← 이미지 선택
      </Button>
      <Button type='submit' disabled={processing || sortedFiles.length === 0}>
        메타데이터 적용하기 →
      </Button>
    </div>
  </form>
</section>
```

처리 중 진행 문구는 기존 `completed / sortedFiles.length` 정보를 유지하고 `aria-live='polite'`로 제공한다.

- [ ] **Step 5: 검사 후 커밋**

Run:

```bash
pnpm check
```

Commit:

```bash
git add src/components/layout/MetadataSettings src/components/ui/MetadataCard src/types/metadataCard.types.ts
git commit -m "style: 메타데이터 설정을 균등 카드 그리드로 개편"
```

---

### Task 6: 결과 화면을 사진 중심 갤러리로 개편

**Files:**
- Modify: `src/components/layout/ResultsViewer/index.tsx:1-112`
- Modify: `src/components/ui/ImageCard/index.tsx:1-89`
- Modify: `src/types/imageCard.types.ts:1-13`

- [ ] **Step 1: ImageCard에서 기기 감지 상태 제거**

`react-device-detect`, `useEffect`, `useState`를 제거한다. 다운로드 버튼은 항상 DOM에 존재하도록 카드 하단 메타 영역에 배치한다. 데스크톱에서는 아이콘 버튼, 작은 화면에서는 텍스트가 보이게 한다.

```tsx
<article className='overflow-hidden rounded-xl border border-border bg-surface'>
  <div className='relative aspect-4/3 overflow-hidden bg-surface-alt'>
    <Image
      src={image.url}
      alt={`메타데이터가 적용된 ${image.name}`}
      className='object-cover'
      fill
      loading='lazy'
      sizes='(max-width: 479px) 100vw, (max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw'
      unoptimized
    />
  </div>
  <div className='flex items-center justify-between gap-3 p-3'>
    <div className='min-w-0'>
      <h2 className='truncate text-xs font-medium text-foreground'>{image.name}</h2>
      {image.dateTime && (
        <p className='mt-1 truncate text-[11px] text-foreground-muted'>{image.dateTime}</p>
      )}
    </div>
    <button
      type='button'
      onClick={() => onDownload(image)}
      disabled={processing}
      className='grid h-11 w-11 shrink-0 place-items-center rounded-[10px] border border-border text-foreground-muted transition-colors hover:bg-surface-alt hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40'
      aria-label={`${image.name} 다운로드`}
    >
      <Download size={16} aria-hidden />
    </button>
  </div>
</article>
```

- [ ] **Step 2: ResultsViewer에 StepIntro와 대표 행동 배치**

큰 외부 카드 wrapper를 제거한다.

```tsx
<section ref={resultRef} aria-labelledby='results-section'>
  <StepIntro
    eyebrow='03 / EXPORT'
    title='결과를 확인하세요'
    titleId='results-section'
    description={<p>사진을 개별로 받거나 성공한 결과를 ZIP 파일로 내려받을 수 있어요.</p>}
  />
  <div className='mb-6 flex flex-col gap-3 border-y border-border py-4 sm:flex-row sm:items-center sm:justify-between'>
    <p className='text-sm text-foreground-secondary'>
      {resultImages.length} images ready
    </p>
    <Button ...>ZIP 다운로드</Button>
  </div>
  {/* ProgressBar, ErrorDisplay, gallery */}
</section>
```

갤러리 클래스는 명세의 breakpoint를 그대로 반영한다.

```txt
grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4
```

- [ ] **Step 3: 빈 결과와 부분 실패 상태 수정**

결과가 없고 오류만 있으면 `처리된 이미지가 없어요`와 `메타데이터 설정으로 돌아가기` secondary 버튼을 표시한다. 결과와 오류가 함께 있으면 ErrorDisplay 다음에 성공 갤러리를 계속 보여준다. ZIP 버튼은 `resultImages.length === 0`일 때만 숨긴다.

- [ ] **Step 4: 검사 후 커밋**

Run:

```bash
pnpm check
```

Commit:

```bash
git add src/components/layout/ResultsViewer src/components/ui/ImageCard src/types/imageCard.types.ts
git commit -m "style: 결과 화면을 사진 중심 갤러리로 개편"
```

---

### Task 7: Footer와 오류·로딩·404 화면을 같은 브랜드 체계로 정리

**Files:**
- Modify: `src/components/layout/Footer/index.tsx:1-23`
- Modify: `src/app/error.tsx:1-32`
- Modify: `src/app/global-error.tsx:1-39`
- Modify: `src/app/loading.tsx:1-10`
- Modify: `src/app/not-found.tsx:1-20`

- [ ] **Step 1: Footer를 데스크톱 한 줄, 모바일 두 줄로 변경**

```tsx
<footer className={`border-t border-border ${className ?? ''}`}>
  <div className='mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-4 py-5 text-center text-[11px] text-foreground-muted sm:px-6 md:flex-row md:text-left'>
    <p>파일은 서버에 올리지 않고 브라우저에서 안전하게 처리해요.</p>
    <p className='flex flex-wrap items-center justify-center gap-x-3 gap-y-1 md:justify-end'>
      <span>&copy; {year} Hyunsoo Ro</span>
      <a ...>kevinsoo1014@gmail.com</a>
    </p>
  </div>
</footer>
```

- [ ] **Step 2: 보조 화면에서 큰 shadow card와 딱딱한 문구 제거**

공통 문구:

- 오류 제목: `문제가 생겼어요`
- 오류 설명: `잠시 후 다시 시도해 주세요. 같은 문제가 계속되면 새로고침해 주세요.`
- 404 제목: `페이지를 찾지 못했어요`
- 404 설명: `주소가 바뀌었거나 존재하지 않는 페이지예요.`
- 404 행동: `Film Metadata로 돌아가기`
- 로딩 aria-label: `화면을 불러오고 있어요`

Error와 NotFound 표면은 `max-w-md rounded-2xl border border-border bg-surface p-6`을 사용하고 shadow는 제거한다.

`global-error.tsx`는 루트 stylesheet가 로드되지 않을 수 있으므로 Tailwind 색상 토큰에 의존하지 않는다. `<body>`와 카드에 아래 inline style을 직접 적용하고, 버튼에도 배경 `#3182f6`, 글자 `#ffffff`, 최소 높이 `44px`를 준다. `data-theme='dark'` 고정값은 제거해 오류 화면이 임의로 다크 모드가 되지 않게 한다.

```tsx
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
          border: '1px solid #f4f4f8',
          borderRadius: '16px',
          background: '#ffffff',
          padding: '24px',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '20px', lineHeight: 1.3 }}>
          문제가 생겼어요
        </h1>
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
```

- [ ] **Step 3: 검사 후 커밋**

Run:

```bash
pnpm check
```

Commit:

```bash
git add src/components/layout/Footer src/app/error.tsx src/app/global-error.tsx src/app/loading.tsx src/app/not-found.tsx
git commit -m "style: 푸터와 보조 상태 화면 정리"
```

---

### Task 8: 반응형·다크 모드·접근성 일관성 보정

**Files:**
- Modify: `src/styles/globals.css`
- Modify: `src/components/layout/StepNavigation/index.tsx`
- Modify: `src/components/layout/FileSelection/index.tsx`
- Modify: `src/components/layout/MetadataSettings/index.tsx`
- Modify: `src/components/layout/MetadataSettings/components/PresetBar.tsx`
- Modify: `src/components/layout/ResultsViewer/index.tsx`
- Modify: `src/components/ui/DropZone/index.tsx`
- Modify: `src/components/ui/FileList/index.tsx`
- Modify: `src/components/ui/ImageCard/index.tsx`

- [ ] **Step 1: 44px 터치 영역과 포커스 링 점검**

다음 요소가 `min-h-11` 또는 `h-11 w-11`을 갖는지 확인하고 누락된 클래스만 추가한다.

- 테마 전환
- 단계 버튼
- 파일 선택
- 프리셋 저장·가져오기·내보내기
- 이전·다음·적용·ZIP 버튼
- 개별 이미지 다운로드
- 날짜 선택 입력

모든 인터랙션 요소는 `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`을 갖는다.

- [ ] **Step 2: 모바일 레이아웃 계약 확인**

코드 기준:

- 768px 미만: StepNavigation 라벨 숨김
- 768px 미만: 파일 선택 한 열
- 768px 미만: 메타데이터 카드 한 열
- 480px 미만: 결과 카드 한 열
- PresetToolbar: `flex-col items-stretch sm:flex-row sm:items-center`
- 하단 행동: 좁은 화면에서도 primary 버튼 텍스트가 잘리지 않도록 `flex-wrap`

- [ ] **Step 3: motion과 색상 대비 보정**

`transition-all`을 제거하고 필요한 속성만 `transition-colors`, `transition-opacity`, `transition-[width]`로 제한한다. `prefers-reduced-motion`에서 spinner를 제외한 화면 전환을 제거한다. 다크 모드에서 border와 muted text가 배경과 구분되는지 브라우저로 확인할 항목으로 기록한다.

- [ ] **Step 4: 접근성 정적 검사**

Run:

```bash
pnpm check
```

Expected:

- Biome a11y 오류 0
- TypeScript 오류 0
- `aria-current='step'`, `disabled`, `aria-live`, `aria-invalid` 유지

- [ ] **Step 5: 커밋**

```bash
git add src/styles/globals.css src/components/layout/StepNavigation src/components/layout/FileSelection src/components/layout/MetadataSettings src/components/layout/ResultsViewer src/components/ui/DropZone src/components/ui/FileList src/components/ui/ImageCard
git commit -m "a11y: 반응형과 키보드 접근성 보정"
```

---

### Task 9: 전체 흐름 브라우저 검증과 최종 정리

**Files:**
- Modify only when verification finds a concrete defect.

- [ ] **Step 1: 최종 자동 검사**

Run:

```bash
pnpm check
git diff --check
```

Expected: 두 명령 모두 exit code 0.

- [ ] **Step 2: 개발 서버 실행**

Run:

```bash
pnpm dev
```

Expected: Next.js 개발 서버가 사용 가능한 로컬 포트에서 준비된다. `pnpm build`는 실행하지 않는다.

- [ ] **Step 3: 브라우저 업로드용 임시 JPEG fixture 준비**

저장소 파일은 수정하지 않고 `/tmp/film-metadata-fixtures`에 검증 파일 3개를 만든다. macOS `sips`로 기존 OG PNG를 JPEG로 변환하고 파일명 natural sort가 드러나도록 복제한다.

Run:

```bash
mkdir -p /tmp/film-metadata-fixtures
sips -s format jpeg public/images/og-image.png --out /tmp/film-metadata-fixtures/film-1.jpg
cp /tmp/film-metadata-fixtures/film-1.jpg /tmp/film-metadata-fixtures/film-2.jpg
cp /tmp/film-metadata-fixtures/film-1.jpg /tmp/film-metadata-fixtures/film-10.jpg
```

Expected: `film-1.jpg`, `film-2.jpg`, `film-10.jpg`가 생성되고 Git 상태에는 변화가 없다.

- [ ] **Step 4: 빈 1단계 검증**

인앱 브라우저에서 확인한다.

- 데스크톱 1440x1000, 라이트
- `Film Metadata` 워드마크
- `01 Select` 현재 단계
- 업로드와 빈 파일 목록 2열
- 다음 단계 disabled
- 테마 버튼 키보드 focus

- [ ] **Step 5: 파일 선택 후 1단계 검증**

`/tmp/film-metadata-fixtures`의 JPG 3개를 업로드한다.

- natural sort 순서
- 각 파일명과 MB
- `3 files`, 총용량, `JPG / JPEG`
- 2단계 활성화
- 새 파일 선택 시 기존 목록 교체

- [ ] **Step 6: 2단계와 프리셋 검증**

- 2x2 카드 그리드
- Capture, Camera, Lens, Film 라벨
- 필수 날짜·시간 오류와 `aria-describedby`
- 프리셋 저장, 불러오기, 삭제
- JSON 내보내기와 가져오기
- 처리 중 버튼 disabled와 진행 개수 `aria-live`

- [ ] **Step 7: 3단계 결과 검증**

- 성공 이미지를 사진 중심 카드로 표시
- 파일명과 촬영일 표시
- 개별 다운로드 버튼이 hover 없이 접근 가능
- ZIP 진행률 표시
- 일부 실패 시 오류와 성공 이미지 동시 표시
- 성공 결과만 ZIP 대상

- [ ] **Step 8: 반응형과 테마 매트릭스 검증**

각 화면에서 다음 viewport와 테마를 확인한다.

| Viewport | Light | Dark |
| --- | --- | --- |
| 1440x1000 | 확인 | 확인 |
| 900x1000 | 확인 | 확인 |
| 390x844 | 확인 | 확인 |

확인 항목:

- 가로 스크롤 없음
- StepNavigation 연결선과 숫자 겹침 없음
- PresetToolbar 버튼 잘림 없음
- 카드 제목과 입력 도움말 겹침 없음
- 결과 1/2/3/4열 breakpoint 준수
- 다크 모드에서 Action Blue, 헤어라인, muted text 구분

- [ ] **Step 9: 보조 화면과 reduced motion 검증**

- 존재하지 않는 경로에서 404 문구와 홈 링크 확인
- 오류 화면의 버튼 포커스 확인
- 브라우저에서 reduced motion을 활성화했을 때 단계 진입 이동이 사라지는지 확인

- [ ] **Step 10: 발견된 결함만 수정하고 다시 검사**

Run:

```bash
pnpm check
git diff --check
```

- [ ] **Step 11: 검증 보정 커밋**

변경이 있을 때만:

```bash
git add <검증에서 수정한 파일>
git commit -m "fix: 디자인 개편 검증 이슈 수정"
```

변경이 없으면 커밋하지 않는다.

- [ ] **Step 12: 임시 fixture 삭제와 브랜치 상태 보고**

Run:

```bash
rm -rf /tmp/film-metadata-fixtures
git status --short
git log --oneline develop..HEAD
```

Expected: 작업 트리가 깨끗하고 디자인 명세 커밋 이후 유형별 구현 커밋이 나열된다.
