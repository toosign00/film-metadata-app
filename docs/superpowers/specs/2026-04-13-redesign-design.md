# Film Metadata App — UI/UX 리디자인 스펙

**날짜:** 2026-04-13  
**상태:** 승인됨

---

## 개요

현재 디자인이 AI 생성 느낌을 주는 원인(과도한 그림자, 일관성 없는 간격, 앰버 액센트 남용, 카드 중첩 등)을 제거하고, 실력 있는 디자이너가 만든 것처럼 보이는 Minimal/Clean 방향으로 전면 리디자인한다.

---

## 디자인 결정 사항

### 1. 스타일 방향
**Minimal / Clean Light**

- 불필요한 장식 제거. 정보와 기능 중심.
- 과도한 `shadow-md` 남용 제거. 그림자는 elevation이 실제로 필요한 곳에만.
- 컴포넌트 간 일관된 간격 시스템 적용.
- 이모지 사용 금지 (UI 내 텍스트, 레이블, 버튼 등).

### 2. 레이아웃
**히어로 헤더 + 프로그레스 스테퍼**

- 헤더(`<header>`)가 타이틀 + 설명 + 스테퍼를 모두 포함.
- 스테퍼는 헤더 하단에 위치. 별도의 sticky nav 제거.
- 현재 `StepNavigation` 컴포넌트(sticky top bar)는 헤더 내 스테퍼로 통합.
- 스테퍼 구조: 원형 번호 + 라벨 + 연결선. 완료 단계는 체크 표시.
- 초기화 버튼은 헤더 우측 하단 또는 스테퍼 옆에 작게 배치.

### 3. 컬러 시스템
**Cool Clean — 차콜 + 블루 액센트**

#### 라이트 모드 (기본)
| 토큰 | 값 | 용도 |
|------|----|------|
| `--color-background` | `#f8f9fa` | 페이지 배경 |
| `--color-surface` | `#ffffff` | 카드, 인풋 배경 |
| `--color-surface-alt` | `#f3f4f6` | 파일 리스트 아이템, 보조 배경 |
| `--color-foreground` | `#111827` | 본문 텍스트 |
| `--color-foreground-secondary` | `#374151` | 라벨, 보조 텍스트 |
| `--color-foreground-muted` | `#6b7280` | placeholder, 설명 텍스트 |
| `--color-border` | `#e5e7eb` | 기본 보더 |
| `--color-border-hover` | `#d1d5db` | hover 보더 |
| `--color-primary` | `#2563eb` | 액센트, 포커스 링, 활성 스텝 |
| `--color-primary-hover` | `#1d4ed8` | 버튼 hover |
| `--color-primary-foreground` | `#ffffff` | 블루 버튼 텍스트 |
| `--color-primary-muted` | `#93c5fd` | 보조 액센트 |
| `--color-destructive` | `#dc2626` | 에러, 삭제 |

#### 다크 모드
- 라이트와 동일한 토큰 구조 유지.
- 배경: `#111827`, 서페이스: `#1f2937`, 보더: `#374151`.
- 블루 액센트(`#2563eb`)는 다크에서도 동일하게 유지.

### 4. 컴포넌트 스타일
**카드 + 보더리스 인풋**

#### 섹션 카드
- 배경 `#ffffff`, `border: 1px solid #e5e7eb`, `border-radius: 10px`
- `box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)` (미세한 elevation만)
- 카드 내부 상단에 섹션 타이틀 (`font-size: 11px`, `font-weight: 600`, `text-transform: uppercase`, `letter-spacing: 0.06em`, `color: #374151`)

#### 인풋 필드
- 카드 내부에서는 보더 없이 하단 구분선(`border-bottom: 1px solid #f3f4f6`)만 사용
- 카드 외부 단독 인풋은 `border: 1px solid #e5e7eb`, `border-radius: 6px`
- 포커스 시: `outline: none`, `box-shadow: 0 0 0 3px rgba(37,99,235,0.12)`, `border-color: #2563eb`
- 라벨: `font-size: 11px`, `font-weight: 500`, `color: #6b7280`, `text-transform: uppercase`, `letter-spacing: 0.04em`
- 에러 시: `border-color: #dc2626`, `box-shadow: 0 0 0 3px rgba(220,38,38,0.12)`

#### 버튼
- **Primary**: `background: #111827`, `color: #fff`, `border-radius: 8px`, `padding: 10px 20px`, `font-weight: 600`
- **Primary hover**: `background: #1f2937`
- **Secondary**: `background: transparent`, `border: 1px solid #e5e7eb`, `color: #374151`
- **Text/Ghost**: 배경 없음, hover 시 `background: #f3f4f6`
- **Destructive**: `background: #dc2626`
- 모든 버튼 `cursor: pointer`, 비활성 `opacity: 0.4`
- 로딩 스피너는 버튼 내 유지

#### 드롭존
- `border: 1.5px dashed #d1d5db`, `border-radius: 10px`, `background: #fff`
- 드래그 오버 시: `border-color: #2563eb`, `background: #eff6ff`
- 아이콘은 lucide-react 유지, 단 크기 축소 (48px → 36px)
- 텍스트: 이모지 없이 텍스트만

#### 파일 리스트 아이템
- `background: #f9fafb`, `border-radius: 6px`, `padding: 8px 10px`
- 작은 원형 인디케이터 + 파일명 + 파일 크기 오른쪽 정렬
- 구분선 없이 gap으로만 간격 처리

#### 스테퍼 (헤더 내)
- 원형: `width: 28px`, `height: 28px`
- 활성: `background: #111827`, `color: #fff`
- 완료: `background: #2563eb`, 체크 아이콘
- 비활성: `border: 1.5px solid #d1d5db`, `color: #9ca3af`
- 연결선: `height: 1px`, `background: #e5e7eb`
- 스텝 라벨: 데스크탑에서 표시, 모바일에서 숨김

#### 이미지 카드 (결과 화면)
- `border-radius: 8px`, `border: 1px solid #e5e7eb`
- 그림자: `0 1px 2px rgba(0,0,0,0.06)` 만
- hover 시 scale 효과 제거 또는 최소화 (`scale(1.02)` 이하)
- 다운로드 버튼: hover overlay 유지하되 배경 `rgba(0,0,0,0.6)` → `rgba(17,24,39,0.75)`

### 5. 타이포그래피
- 폰트 패밀리 변경 없음 (Pretendard 유지)
- 헤더 타이틀: `font-size: 22px`, `font-weight: 700`, `letter-spacing: -0.6px`
- 섹션 헤딩: 원형 번호 배지 제거 → `font-size: 15px`, `font-weight: 600`으로 단순화
- 라벨 스타일 통일: uppercase + letter-spacing 패턴으로 계층 표현

### 6. 간격 시스템
- 기본 단위: `4px`
- 카드 내부 패딩: `20px 24px`
- 섹션 간 gap: `16px`
- 폼 필드 간 gap: `16px`
- 페이지 수평 패딩: `24px` (모바일), `32px` (데스크탑)

### 7. 다크모드
- 라이트 모드가 기본 (`defaultTheme: "light"`)
- 헤더 우측 토글 버튼 유지
- `next-themes` 사용 유지
- `data-theme` 속성 기반 CSS 변수 오버라이드 방식 유지

---

## 변경 범위

### globals.css
- 전체 CSS 변수 토큰 교체 (앰버 → 블루 액센트)
- 라이트/다크 토큰 모두 업데이트

### Header
- 타이틀/설명 + 스테퍼를 하나의 헤더로 통합
- `StepNavigation` 역할 흡수

### StepNavigation
- 삭제 또는 헤더 내부 컴포넌트로 리팩터
- sticky top bar 제거

### Button
- 스타일 토큰 업데이트
- Primary 버튼을 블루 대신 차콜(`#111827`)로

### DropZone
- 스타일 업데이트, 이모지 제거

### FileList / 파일 아이템
- 아이템 스타일 개선

### MetadataSettings 섹션 카드들
- 카드 + 보더리스 인풋 패턴 적용
- 섹션 헤딩에서 원형 번호 배지 제거
- `CameraSection`, `LensSection`, `FilmSection`, `DateTimeSection` 모두

### ImageCard
- 그림자, hover 효과 개선

### ResultsViewer / FileSelection
- 섹션 헤딩 스타일 통일

### Footer
- 간격, 타이포그래피 정리

---

## 변경하지 않는 것

- 기능 로직, 상태 관리, hooks, services — 전혀 손대지 않음
- 컴포넌트 파일 구조 및 props 인터페이스
- 접근성(aria) 속성
- Radix UI AlertDialog, react-datepicker, sonner 등 서드파티 컴포넌트 동작

---

## 성공 기준

- "AI가 만든 것 같다"는 느낌이 없어야 함
- 과도한 그림자, 앰버 글로우, 중첩 카드가 없어야 함
- 라이트/다크 양쪽에서 모두 일관된 느낌
- 모든 인터랙티브 요소에 포커스 링 적용
- 모바일(375px)과 데스크탑(1280px) 모두 정상 동작
