# Next.js + TypeScript + Emotion 스타일 가이드

이 문서는 Next.js(App Router), TypeScript, Emotion을 사용하는 프로젝트의 코딩 컨벤션 및 모범 사례를 정의합니다.

---

## 1. 프로젝트 구조

기능(Feature) 단위로 응집도를 높이는 Co-location 패턴을 지향합니다.

```
src/
├── app/
│   ├── layout.tsx              # 전역 레이아웃 (Emotion Registry 포함)
│   ├── providers.tsx           # Emotion, React Query 등 Provider 모음
│   ├── page.tsx
│   └── (auth)/                 # Route Group 예시
│       ├── login/
│       └── register/
├── components/
│   ├── ui/                     # 재사용 가능한 공통 UI
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.style.ts
│   │   │   └── index.ts        # named export
│   │   └── Input/
│   └── layout/                 # 레이아웃 컴포넌트
│       ├── Header/
│       └── Footer/
├── features/                   # 비즈니스 로직 단위
│   └── auth/
│       ├── components/         # 해당 기능 전용 컴포넌트
│       ├── hooks/
│       ├── api/                # API 호출 함수
│       └── types.ts            # 해당 기능 타입 정의
├── styles/
│   ├── globals.css
│   ├── theme.ts
│   ├── emotion.d.ts
│   └── common.ts               # 공통 스타일 유틸리티
├── hooks/                      # 전역 커스텀 훅
├── lib/                        # 유틸리티 및 설정
│   ├── emotion-registry.tsx
│   └── utils/
└── types/                      # 전역 타입 정의
    └── common.ts
```

### 규칙

- 컴포넌트 폴더는 `index.ts`를 통해 named export 제공
- 스타일 파일이 50줄 이상이면 별도 `.style.ts` 파일로 분리
- 페이지 전용 컴포넌트는 해당 페이지 폴더 내 `_components/` 에 위치

---

## 2. Emotion 스타일링 규칙

### 2.1. Styled Components 방식 선호

**Good:**

```tsx
import styled from '@emotion/styled';

export function UserCard() {
  return (
    <Container>
      <Title>홍길동</Title>
      <Description>프론트엔드 개발자</Description>
    </Container>
  );
}

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.background.card};
  border-radius: ${({ theme }) => theme.radius.md};
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.size.lg};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Description = styled.p`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;
```

**Bad:**

```tsx
// ❌ css prop은 일회성 스타일에만 사용
<div css={css`padding: 16px;`}>
  <h3 css={css`font-size: 18px;`}>홍길동</h3>
</div>

// ❌ 인라인 스타일 사용 금지
<div style={{ padding: '16px' }}>
```

### 2.2. Theme 객체 적극 활용

모든 디자인 토큰은 theme 객체에서 관리합니다.

**theme.ts 예시:**

```ts
export const theme = {
  colors: {
    primary: '#3366FF',
    secondary: '#6B7280',
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      disabled: '#D1D5DB',
    },
    background: {
      main: '#FFFFFF',
      card: '#F9FAFB',
    },
    border: {
      light: '#E5E7EB',
      dark: '#D1D5DB',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  typography: {
    size: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
    },
    weight: {
      regular: 400,
      medium: 500,
      bold: 700,
    },
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  breakpoints: {
    mobile: '576px',
    tablet: '768px',
    desktop: '1024px',
  },
} as const;
```

**Bad:**

```tsx
// ❌ 하드코딩 금지
const Box = styled.div`
  color: #333d4b;
  padding: 16px;
  font-size: 14px;
`;
```

**Good:**

```tsx
const Box = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  padding: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.size.sm};
`;
```

### 2.3. 동적 스타일링과 Transient Props

Props에 따라 스타일이 변경될 때는 **Transient Props(`$` 접두사)**를 사용합니다.

```tsx
interface ButtonStyleProps {
  $variant: 'primary' | 'secondary';
  $size: 'sm' | 'md' | 'lg';
  $fullWidth?: boolean;
}

const StyledButton = styled.button<ButtonStyleProps>`
  /* variant에 따른 스타일 */
  background-color: ${({ theme, $variant }) =>
    $variant === 'primary' ? theme.colors.primary : theme.colors.secondary};

  /* size에 따른 스타일 */
  padding: ${({ theme, $size }) => {
    const sizeMap = {
      sm: `${theme.spacing.xs} ${theme.spacing.sm}`,
      md: `${theme.spacing.sm} ${theme.spacing.md}`,
      lg: `${theme.spacing.md} ${theme.spacing.lg}`,
    };
    return sizeMap[$size];
  }};

  /* 조건부 스타일 */
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};

  /* 상태에 따른 스타일 */
  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// 사용 예시
<StyledButton $variant="primary" $size="md" $fullWidth>
  확인
</StyledButton>;
```

**공통 스타일 유틸리티 활용:**

```ts
// styles/common.ts
import { css } from '@emotion/react';
import { Theme } from './theme';

export const flexCenter = css`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const flexColumn = css`
  display: flex;
  flex-direction: column;
`;

export const truncate = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const hideScrollbar = css`
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

// 사용
const Container = styled.div`
  ${flexCenter}
  ${hideScrollbar}
  padding: ${({ theme }) => theme.spacing.md};
`;
```

### 2.4. 반응형 디자인

```ts
// styles/common.ts
export const mediaQuery = {
  mobile: `@media (max-width: 576px)`,
  tablet: `@media (max-width: 768px)`,
  desktop: `@media (min-width: 1024px)`,
};

// 사용
const ResponsiveContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};

  ${mediaQuery.tablet} {
    padding: ${({ theme }) => theme.spacing.lg};
  }

  ${mediaQuery.mobile} {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;
```

### 2.5. Next.js App Router SSR 설정

**lib/emotion-registry.tsx:**

```tsx
'use client';

import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';
import { useState } from 'react';

export function EmotionRegistry({ children }: { children: React.ReactNode }) {
  const [cache] = useState(() => {
    const cache = createCache({ key: 'css' });
    cache.compat = true;
    return cache;
  });

  useServerInsertedHTML(() => {
    return (
      <style
        data-emotion={`${cache.key} ${Object.keys(cache.inserted).join(' ')}`}
        dangerouslySetInnerHTML={{
          __html: Object.values(cache.inserted).join(' '),
        }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
```

**app/layout.tsx:**

```tsx
import { EmotionRegistry } from '@/lib/emotion-registry';
import { ThemeProvider } from '@emotion/react';
import { theme } from '@/styles/theme';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <EmotionRegistry>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </EmotionRegistry>
      </body>
    </html>
  );
}
```

---

## 3. TypeScript 타입 정의

### 3.1. Theme 타입 확장

**styles/emotion.d.ts:**

```ts
import '@emotion/react';
import { theme } from './theme';

type ThemeType = typeof theme;

declare module '@emotion/react' {
  export interface Theme extends ThemeType {}
}
```

### 3.2. Props 타입 정의 규칙

```tsx
// ✅ Good: interface 사용, 명확한 네이밍
interface UserCardProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
  onEdit?: (userId: string) => void;
  isEditable?: boolean;
}

// ✅ 자주 사용되는 타입은 분리
// types/common.ts
export interface User {
  id: string;
  name: string;
  email: string;
}

// 컴포넌트에서
interface UserCardProps {
  user: User;
  onEdit?: (userId: string) => void;
  isEditable?: boolean;
}

// ❌ Bad: type으로 정의, 불명확한 네이밍
type Props = {
  data: any;
  onClick: Function;
};
```

### 3.3. 이벤트 핸들러 타입

```tsx
import { MouseEvent, ChangeEvent, FormEvent } from 'react';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // ...
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    // ...
  };

  const handleButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    // ...
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## 4. 컴포넌트 작성 패턴

### 4.1. 컴포넌트 선언 규칙

```tsx
// ✅ Good: 함수 선언문 사용
interface UserProfileProps {
  name: string;
  age: number;
  bio?: string;
}

export function UserProfile({ name, age, bio }: UserProfileProps) {
  return (
    <Container>
      <Name>{name}</Name>
      <Age>{age}세</Age>
      {bio && <Bio>{bio}</Bio>}
    </Container>
  );
}

// ❌ Bad: 화살표 함수 (디버깅 시 이름 표시 안 됨)
const UserProfile = ({ name, age }: UserProfileProps) => {
  return <div>...</div>;
};
```

### 4.2. 조건부 렌더링

```tsx
// ✅ Good: Early Return 패턴
export function UserProfile({ user }: { user: User | null }) {
  if (!user) {
    return <EmptyState message="사용자 정보가 없습니다" />;
  }

  if (user.isBlocked) {
    return <BlockedUserMessage />;
  }

  return (
    <Container>
      <Name>{user.name}</Name>
      <Email>{user.email}</Email>
    </Container>
  );
}

// ✅ 복잡한 조건은 별도 함수로 분리
function getUserStatusComponent(status: UserStatus) {
  switch (status) {
    case 'active':
      return <ActiveBadge />;
    case 'pending':
      return <PendingBadge />;
    case 'blocked':
      return <BlockedBadge />;
    default:
      return null;
  }
}

export function UserCard({ user }: { user: User }) {
  return (
    <Container>
      {getUserStatusComponent(user.status)}
      <Name>{user.name}</Name>
    </Container>
  );
}

// ❌ Bad: 중첩된 삼항 연산자
return (
  <div>
    {user ? (
      user.isActive ? (
        <ActiveUser />
      ) : user.isPending ? (
        <PendingUser />
      ) : (
        <InactiveUser />
      )
    ) : (
      <NoUser />
    )}
  </div>
);
```

### 4.3. 컴포넌트 분리 기준

**하나의 컴포넌트는 하나의 책임만 가져야 합니다.**

```tsx
// ❌ Bad: 하나의 컴포넌트에 너무 많은 로직
export function UserDashboard() {
  // 사용자 데이터 fetch
  const { data: user } = useQuery(...);

  // 통계 데이터 fetch
  const { data: stats } = useQuery(...);

  // 폼 상태 관리
  const [form, setForm] = useState(...);

  // 100줄 이상의 JSX...
  return <div>...</div>;
}

// ✅ Good: 책임별로 컴포넌트 분리
export function UserDashboard() {
  const { data: user } = useUserQuery();
  const { data: stats } = useUserStatsQuery();

  return (
    <Container>
      <UserProfile user={user} />
      <UserStats stats={stats} />
      <UserActivityList userId={user.id} />
    </Container>
  );
}
```

### 4.4. 컴포넌트 파일 구조 순서

```tsx
// 1. 외부 라이브러리 import
import { useState, useEffect } from 'react';
import styled from '@emotion/styled';

// 2. 내부 컴포넌트/훅 import
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

// 3. 타입 import
import type { User } from '@/types/user';

// 4. 타입 정의
interface UserCardProps {
  user: User;
  onEdit: (id: string) => void;
}

// 5. 메인 컴포넌트
export function UserCard({ user, onEdit }: UserCardProps) {
  // 5-1. 훅
  const [isEditing, setIsEditing] = useState(false);
  const { currentUser } = useAuth();

  // 5-2. 이벤트 핸들러
  const handleEdit = () => {
    setIsEditing(true);
  };

  // 5-3. 렌더링
  return (
    <Container>
      <Name>{user.name}</Name>
      <Button onClick={handleEdit}>수정</Button>
    </Container>
  );
}

// 6. 스타일 컴포넌트 (파일 하단)
const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
`;

const Name = styled.h3`
  font-size: ${({ theme }) => theme.typography.size.lg};
`;
```

---

## 5. 상태 관리

### 5.1. 서버 상태 - TanStack Query

```tsx
// features/user/api/userApi.ts
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

export async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) throw new Error('Failed to fetch user');
  return response.json();
}

// features/user/hooks/useUser.ts
import { useQuery } from '@tanstack/react-query';
import { fetchUser, userKeys } from '../api/userApi';

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUser(id),
    staleTime: 5 * 60 * 1000, // 5분
  });
}

// 컴포넌트에서 사용
export function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading, error } = useUser(userId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;
  if (!user) return null;

  return <UserCard user={user} />;
}
```

**❌ 안티패턴:**

```tsx
// useEffect + useState 조합 금지
export function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => setUser(data))
      .finally(() => setLoading(false));
  }, [userId]);

  // ...
}
```

### 5.2. 클라이언트 전역 상태 - Zustand

```ts
// store/useModalStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ModalState {
  isOpen: boolean;
  modalType: 'confirm' | 'alert' | null;
  modalProps: Record<string, any>;
  open: (type: ModalState['modalType'], props?: Record<string, any>) => void;
  close: () => void;
}

export const useModalStore = create<ModalState>()(
  devtools(
    (set) => ({
      isOpen: false,
      modalType: null,
      modalProps: {},
      open: (type, props = {}) =>
        set({ isOpen: true, modalType: type, modalProps: props }),
      close: () =>
        set({ isOpen: false, modalType: null, modalProps: {} }),
    }),
    { name: 'ModalStore' }
  )
);

// 사용
export function SomeComponent() {
  const { open } = useModalStore();

  const handleDelete = () => {
    open('confirm', {
      title: '정말 삭제하시겠습니까?',
      onConfirm: () => {
        // 삭제 로직
      },
    });
  };

  return <Button onClick={handleDelete}>삭제</Button>;
}
```

### 5.3. 로컬 상태 - useState

```tsx
// ✅ Good: 한 컴포넌트 내에서만 사용되는 UI 상태
export function SearchInput() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    />
  );
}
```

---

## 6. 성능 최적화

### 6.1. 폰트 최적화

```tsx
// app/layout.tsx
import { Pretendard } from 'next/font/google';

const pretendard = Pretendard({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-pretendard',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body>{children}</body>
    </html>
  );
}
```

```css
/* styles/globals.css */
body {
  font-family:
    var(--font-pretendard),
    -apple-system,
    BlinkMacSystemFont,
    system-ui,
    sans-serif;
}
```

### 6.2. 이미지 최적화

```tsx
import Image from 'next/image';

// ✅ Good
<Image
  src="/profile.jpg"
  alt="프로필 이미지"
  width={200}
  height={200}
  priority // Above the fold인 경우
/>

// 외부 이미지
<Image
  src="https://example.com/image.jpg"
  alt="외부 이미지"
  width={400}
  height={300}
  loader={({ src, width, quality }) => {
    return `${src}?w=${width}&q=${quality || 75}`;
  }}
/>

// ❌ Bad
<img src="/profile.jpg" alt="프로필" />
```

### 6.3. 메모이제이션

```tsx
// ✅ Good: 비용이 큰 계산
export function DataTable({ data }: { data: Item[] }) {
  const processedData = useMemo(() => {
    return data
      .filter((item) => item.isActive)
      .sort((a, b) => b.score - a.score)
      .slice(0, 100);
  }, [data]);

  return <Table data={processedData} />;
}

// ✅ Good: 자식 컴포넌트에 전달하는 함수
export function ParentComponent() {
  const handleClick = useCallback((id: string) => {
    console.log('Clicked:', id);
  }, []);

  return <ChildComponent onClick={handleClick} />;
}

// ❌ Bad: 불필요한 메모이제이션
export function Counter() {
  const [count, setCount] = useState(0);

  // 단순 연산은 메모이제이션 불필요
  const doubleCount = useMemo(() => count * 2, [count]);

  return <div>{doubleCount}</div>;
}
```

### 6.4. 컴포넌트 지연 로딩

```tsx
import dynamic from 'next/dynamic';

// 클라이언트 전용 컴포넌트
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

// 조건부 렌더링되는 컴포넌트
const Modal = dynamic(() => import('@/components/Modal'));

export function Dashboard() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <HeavyChart data={data} />
      {showModal && <Modal onClose={() => setShowModal(false)} />}
    </div>
  );
}
```

---

## 7. 명명 규칙

### 7.1. 파일 및 폴더

| 대상          | 규칙                | 예시                                 |
| ------------- | ------------------- | ------------------------------------ |
| 컴포넌트 파일 | PascalCase.tsx      | `LoginButton.tsx`, `UserProfile.tsx` |
| 스타일 파일   | PascalCase.style.ts | `Button.style.ts`                    |
| 훅 파일       | camelCase.ts        | `useAuth.ts`, `useModal.ts`          |
| 유틸 파일     | camelCase.ts        | `formatDate.ts`, `validateEmail.ts`  |
| 타입 파일     | camelCase.ts        | `user.types.ts`, `api.types.ts`      |
| 폴더명        | kebab-case          | `user-profile/`, `common-ui/`        |

### 7.2. 변수 및 함수

```tsx
// ✅ Good: 명확하고 의미 있는 이름
const userList = users.filter((user) => user.isActive);
const isAuthenticated = !!token;
const handleSubmit = () => {
  /* ... */
};
const fetchUserData = async (id: string) => {
  /* ... */
};

// ❌ Bad: 축약어, 불명확한 이름
const ul = users.filter((u) => u.isActive);
const flag = !!token;
const submit = () => {
  /* ... */
};
const getData = async (id: string) => {
  /* ... */
};
```

### 7.3. 스타일 컴포넌트

```tsx
// ✅ Good: 역할이 명확한 이름
const Container = styled.div``;
const Header = styled.header``;
const Title = styled.h1``;
const Description = styled.p``;
const PrimaryButton = styled.button``;
const IconWrapper = styled.div``;

// ❌ Bad: 불명확하거나 너무 일반적인 이름
const Div1 = styled.div``;
const Text = styled.p``; // 너무 일반적
const StyledComponent = styled.div``; // 역할 불명확
```

### 7.4. Boolean 변수

```tsx
// ✅ Good: is, has, can 접두사
const isLoading = true;
const hasError = false;
const canEdit = user.role === 'admin';
const shouldShowModal = isAuthenticated && !hasSeenModal;

// ❌ Bad
const loading = true;
const error = false;
const edit = user.role === 'admin';
```

---

## 8. 코드 리뷰 체크리스트

### 8.1. 필수 검토 항목

#### 스타일링

- [ ] 모든 색상, 간격, 폰트 크기가 theme 객체에서 가져오는가?
- [ ] 하드코딩된 값이 없는가?
- [ ] Transient Props를 사용하여 DOM 경고가 없는가?
- [ ] 반응형 디자인이 적용되었는가?
- [ ] 스타일 컴포넌트 이름이 명확한가?

#### 타입

- [ ] Props에 타입이 정의되어 있는가?
- [ ] `any` 타입을 사용하지 않았는가?
- [ ] 이벤트 핸들러에 올바른 타입이 지정되었는가?

#### 컴포넌트

- [ ] 컴포넌트가 단일 책임 원칙을 따르는가?
- [ ] Early Return을 활용하여 가독성을 높였는가?
- [ ] 불필요한 중첩이 없는가?
- [ ] Props drilling이 심하지 않은가? (3단계 이상이면 상태 관리 고려)

#### 성능

- [ ] 불필요한 리렌더링이 발생하지 않는가?
- [ ] `useMemo`, `useCallback`이 적절히 사용되었는가?
- [ ] 큰 컴포넌트는 동적 import를 사용했는가?
- [ ] 이미지는 `next/image`를 사용했는가?

#### 상태 관리

- [ ] 서버 데이터는 React Query를 사용했는가?
- [ ] `useEffect`로 데이터를 fetch하지 않았는가?
- [ ] 전역 상태가 정말 필요한가? (로컬 상태로 충분하지 않은가?)

#### 접근성

- [ ] 시맨틱 HTML을 사용했는가?
- [ ] 이미지에 alt 속성이 있는가?
- [ ] 키보드로 모든 인터랙션이 가능한가?
- [ ] 색상 대비가 충분한가?

---

## 9. Git 커밋 컨벤션

### 9.1. 커밋 메시지 형식

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 9.2. Type 목록

| Type       | 설명                         | 예시                                       |
| ---------- | ---------------------------- | ------------------------------------------ |
| `feat`     | 새로운 기능 추가             | `feat(auth): 로그인 페이지 구현`           |
| `fix`      | 버그 수정                    | `fix(button): 호버 시 색상 오류 수정`      |
| `design`   | UI/UX 디자인 변경            | `design(header): 네비게이션 레이아웃 개선` |
| `style`    | 코드 포맷팅 (기능 변경 없음) | `style: Prettier 적용`                     |
| `refactor` | 코드 리팩토링                | `refactor(user): API 호출 로직 개선`       |
| `perf`     | 성능 개선                    | `perf(list): 가상 스크롤 적용`             |
| `test`     | 테스트 추가/수정             | `test(auth): 로그인 컴포넌트 테스트 추가`  |
| `chore`    | 빌드, 설정 변경              | `chore: ESLint 규칙 추가`                  |
| `docs`     | 문서 수정                    | `docs: README 업데이트`                    |

### 9.3. 예시

```bash
# Good
feat(auth): 소셜 로그인 기능 구현

- 카카오, 네이버 로그인 추가
- OAuth 리다이렉트 처리
- 토큰 저장 로직 구현

Resolves: #123

# Bad
update login
fix bug
```

### 9.4. 브랜치 전략

```
main          (프로덕션)
  ├─ develop  (개발)
      ├─ feature/login-ui
      ├─ feature/user-profile
      └─ fix/header-layout
```

- `feature/`: 새로운 기능
- `fix/`: 버그 수정
- `hotfix/`: 긴급 수정
- `refactor/`: 리팩토링

---

## 10. ESLint & Prettier 설정

### 10.1. .eslintrc.json

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "react-hooks/exhaustive-deps": "warn",
    "prefer-const": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

### 10.2. .prettierrc

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

---

## 11. 추가 권장 사항

### 11.1. 주석 작성

```tsx
// ✅ Good: 복잡한 로직에 대한 설명
/**
 * 사용자의 권한에 따라 접근 가능한 메뉴를 필터링합니다.
 *
 * @param user - 현재 로그인한 사용자
 * @param menus - 전체 메뉴 목록
 * @returns 접근 가능한 메뉴 배열
 */
export function filterMenusByPermission(user: User, menus: Menu[]): Menu[] {
  return menus.filter((menu) => {
    // 관리자는 모든 메뉴 접근 가능
    if (user.role === 'admin') return true;

    // 일반 사용자는 권한이 있는 메뉴만 접근 가능
    return user.permissions.includes(menu.requiredPermission);
  });
}

// ❌ Bad: 자명한 코드에 불필요한 주석
// 사용자 이름을 설정한다
setUserName('홍길동');
```

### 11.2. 에러 처리

```tsx
// ✅ Good: 구체적인 에러 처리
export function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading } = useUser(userId);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    if (error.message === 'UNAUTHORIZED') {
      return <LoginPrompt />;
    }
    return <ErrorMessage message="사용자 정보를 불러올 수 없습니다." />;
  }

  if (!data) {
    return <EmptyState message="사용자 정보가 없습니다." />;
  }

  return <UserCard user={data} />;
}
```

### 11.3. 환경 변수

```env
# .env.local
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
DATABASE_URL=postgresql://...
```

```ts
// lib/env.ts
export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL!,
  gaId: process.env.NEXT_PUBLIC_GA_ID!,
} as const;

// 사용
import { env } from '@/lib/env';

fetch(`${env.apiUrl}/users`);
```

---

이 가이드는 프로젝트 진행에 따라 지속적으로 업데이트됩니다.
