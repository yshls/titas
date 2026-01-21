# Vite + React + TypeScript 스타일 가이드

이 문서는 Vite, React, TypeScript, Tailwind CSS, Emotion을 사용하는 프로젝트의 코딩 컨벤션 및 모범 사례를 정의합니다.

---

## 1. 프로젝트 구조

역할(Role) 기반의 디렉토리 구조를 따르며, 필요 시 기능(Feature) 단위 폴더를 생성하여 파일을 관리합니다.

```
src/
├── assets/                   # 이미지, 폰트 등 정적 에셋
├── components/
│   ├── common/                 # 여러 곳에서 재사용되는 범용 컴포넌트 (Button, Input, Modal 등)
│   └──
├── hooks/                      # 전역적으로 사용되는 커스텀 훅 (e.g., useTitle.ts)
├── layouts/                    # 페이지 레이아웃 컴포넌트 (e.g., RootLayout.tsx)
├── pages/                      # 페이지 단위 컴포넌트
├── services/                   # API 호출, 외부 서비스 연동 등
├── store/                      # 전역 상태 관리 (Zustand)
├── styles/                     # 전역 스타일, 테마, 타입 정의
│   ├── theme.ts                # Emotion에서 사용할 디자인 토큰
│   └── emotion.d.ts            # Emotion 테마 타입 확장
├── types/                      # 전역적으로 사용되는 타입
├── utils/                      # 순수 함수, 특정 프레임워크에 의존하지 않는 유틸리티
└── main.tsx                    # 애플리케이션 진입점
```

### 규칙

- 컴포넌트 폴더는 `index.ts`를 통해 named export를 제공하는 것을 고려할 수 있습니다.
- 스타일 파일(`*.style.ts`)은 컴포넌트 파일이 500줄을 초과하거나 스타일 로직이 매우 복잡할 때 분리합니다.
- 페이지 내에서만 사용되는 컴포넌트는 해당 페이지 폴더 내 `components/` 폴더에 위치시킬 수 있습니다.

---

## 2. 스타일링 전략 (Tailwind + Emotion)

우리 프로젝트는 `Tailwind CSS`를 주요 스타일링 도구로 사용하고, `Emotion`을 보조적으로 사용합니다.

### 2.1. Tailwind CSS (Primary)

- **언제 사용하나:** 레이아웃, 간격, 폰트, 색상 등 대부분의 정적 스타일링에 사용합니다.
- **원칙:** 유틸리티 클래스를 최대한 활용하여 빠르고 일관된 UI를 개발합니다.
- **가독성:** `clsx` 또는 `tailwind-merge`와 같은 라이브러리를 사용하여 조건부 클래스를 관리하는 것을 권장합니다.

**Good:**

```tsx
import clsx from 'clsx';

interface ButtonProps {
  variant: 'primary' | 'secondary';
  isFullWidth: boolean;
}

const Button = ({ variant, isFullWidth }: ButtonProps) => {
  const buttonClasses = clsx(
    'py-2 px-4 rounded-md font-bold transition-colors',
    {
      'bg-blue-500 text-white hover:bg-blue-600': variant === 'primary',
      'bg-gray-200 text-gray-800 hover:bg-gray-300': variant === 'secondary',
      'w-full': isFullWidth,
    },
  );

  return <button className={buttonClasses}>Click me</button>;
};
```

### 2.2. Emotion (Secondary)

- **언제 사용하나:**
  1. Props에 따라 복잡한 동적 스타일이 필요할 때 (예: `TalkPage`의 챗 버블)
  2. `keyframes`을 이용한 세밀한 애니메이션이 필요할 때
  3. CSS 스펙상 Tailwind만으로 표현하기 어려운 스타일(e.g., 복잡한 선택자)을 적용할 때

**Emotion 사용 시 규칙:**

- `styled` 컴포넌트 방식을 선호합니다 (`css` prop은 지양).
- 디자인 토큰은 반드시 `styles/theme.ts`에 정의된 `theme` 객체를 사용합니다.
- 동적 스타일링에는 **Transient Props (`$` 접두사)**를 사용하여 불필요한 prop이 DOM에 렌더링되지 않도록 합니다.

**Good (Emotion):**

```tsx
// styles/theme.ts를 참조하는 컴포넌트
import styled from '@emotion/styled';

interface BubbleProps {
  $isUser: boolean;
}

const MessageBubble = styled.div<BubbleProps>`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme, $isUser }) =>
    $isUser ? theme.colors.primary : theme.colors.background.card};
  color: ${({ theme, $isUser }) =>
    $isUser ? theme.colors.white : theme.colors.text.primary};
  border-radius: ${({ theme }) => theme.radius.lg};

  /* Transient Prop은 DOM에 전달되지 않음 */
  width: ${({ $isUser }) => ($isUser ? 'auto' : '100%')};
`;
```

---

## 3. TypeScript 타입 정의

(기존 내용과 대부분 동일하여 유지, `theme.ts` 예시는 Emotion 섹션에 포함)

### 3.1. Theme 타입 확장

**styles/emotion.d.ts:**

```ts
import '@emotion/react';
import { theme } from './theme'; // theme.ts 경로에 맞게 수정

type ThemeType = typeof theme;

declare module '@emotion/react' {
  export interface Theme extends ThemeType {}
}
```

### 3.2. Props 타입 정의 규칙

- `interface`를 사용하여 Props 타입을 명확하게 정의합니다.
- 전역적으로 사용될 수 있는 타입은 `types/` 폴더에서 관리합니다.

### 3.3. 이벤트 핸들러 타입

- `React.MouseEvent`, `React.ChangeEvent` 등 React에서 제공하는 이벤트 타입을 명시적으로 사용합니다.
- 이벤트 핸들러 함수명은 `handle` 접두사를 사용합니다. (e.g., `handleClick`)

---

## 4. 컴포넌트 작성 패턴

### 4.1. 컴포넌트 선언 규칙

- **`const`와 화살표 함수**를 사용하여 컴포넌트를 선언합니다. 이는 React 커뮤니티에서 널리 사용되는 방식이며, Props와 함께 타입을 명시하는 데 일관성을 제공합니다.

**Good:**

```tsx
import type { FC } from 'react';

interface UserProfileProps {
  name: string;
  age: number;
  bio?: string;
}

const UserProfile: FC<UserProfileProps> = ({ name, age, bio }) => {
  return (
    <div>
      <h1>{name}</h1>
      <p>{age}세</p>
      {bio && <p>{bio}</p>}
    </div>
  );
};

export default UserProfile;
```

### 4.2. 조건부 렌더링

- **Early Return** 패턴을 적극 사용하여 코드의 깊이를 줄이고 가독성을 높입니다.
- 복잡한 조건부 UI는 별도의 함수나 컴포넌트로 분리합니다.
- 중첩된 삼항 연산자는 지양합니다.

### 4.3. 컴포넌트 분리 기준

- **단일 책임 원칙(SRP):** 하나의 컴포넌트는 하나의 기능과 책임만 갖도록 설계합니다.
- **관심사 분리:** 데이터 Fetching 로직(Hooks), 상태 관리 로직(Hooks), 순수 UI(Presentational Components)를 분리합니다.

---

## 5. 상태 관리

### 5.1. 서버 상태: TanStack Query (React Query)

- 서버로부터 받아오는 모든 데이터(GET, POST, PUT, DELETE 후 결과)는 React Query로 관리합니다.
- `useEffect`와 `useState`를 조합하여 서버 데이터를 다루는 안티 패턴을 절대 사용하지 않습니다.

### 5.2. 클라이언트 전역 상태: Zustand

- 여러 컴포넌트나 페이지에서 공유되어야 하는 클라이언트 상태(e.g., 모달 상태, 사용자 설정)는 Zustand로 관리합니다.
- 정말 전역적으로 필요한 상태인지 신중하게 판단하고, 그렇지 않다면 Props Drilling이나 Context API를 대안으로 고려합니다.

### 5.3. 로컬 상태: useState / useReducer

- 단일 컴포넌트 내에서만 사용되는 UI 상태(e.g., input 값, 토글 상태)는 `useState`를 사용합니다.
- 하나의 컴포넌트 내에서 여러 상태가 복잡하게 얽혀있다면 `useReducer`를 사용하여 상태 로직을 분리하는 것을 고려합니다.

---

## 6. 성능 최적화

### 6.1. 컴포넌트 지연 로딩 (Lazy Loading)

- 초기 렌더링에 필요 없는 무거운 컴포넌트(차트 라이브러리, 에디터 등)나 특정 조건에서만 보이는 컴포넌트(모달 등)는 `React.lazy`와 `Suspense`를 사용하여 지연 로딩합니다.

**Good:**

```tsx
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

const MyComponent = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <HeavyComponent />
      </Suspense>
    </div>
  );
};
```

### 6.2. 메모이제이션

- **`useMemo`:** 비용이 큰 계산 결과를 캐싱할 때 사용합니다. 단순한 연산에 남용하지 않습니다.
- **`useCallback`:** 자식 컴포넌트에 함수를 props로 전달할 때, 해당 함수가 불필요하게 재생성되는 것을 방지하기 위해 사용합니다. `React.memo`와 함께 사용할 때 특히 효과적입니다.

---

## 7. 명명 규칙

### 7.1. 파일 및 폴더

| 대상          | 규칙                      | 예시                                                       |
| :------------ | :------------------------ | :--------------------------------------------------------- |
| 컴포넌트 파일 | PascalCase.tsx            | `LoginButton.tsx`, `UserProfile.tsx`                       |
| 훅 파일       | camelCase.ts (use 접두사) | `useAuth.ts`, `useModal.ts`                                |
| 그 외 파일    | camelCase.ts              | `apiClient.ts`, `formatDate.ts`                            |
| 폴더명        | camelCase or kebab-case   | `userProfile/` or `user-profile` (프로젝트 내 일관성 유지) |

### 7.2. 변수 및 함수

- 명확하고 의미 있는 전체 단어를 사용합니다. (축약어 지양)
- boolean 변수/상수는 `is`, `has`, `should`, `can` 등의 접두사를 사용합니다.

---

## 8. 환경 변수

- Vite 프로젝트에서는 `.env` 파일에 환경 변수를 정의합니다.
- 클라이언트에서 접근해야 하는 변수는 `VITE_` 접두사를 사용해야 합니다.

**.env.local 예시:**

```env
VITE_API_URL=https://api.example.com
VITE_SUPABASE_KEY=...
```

**사용법:**

```ts
const apiUrl = import.meta.env.VITE_API_URL;
```

---

(이하 Git 컨벤션, 코드 리뷰 체크리스트 등은 기존 내용을 유지합니다. 단, 체크리스트의 Next.js 관련 항목은 제거하거나 수정해야 합니다.)

이 가이드는 프로젝트 진행에 따라 지속적으로 업데이트됩니다.
