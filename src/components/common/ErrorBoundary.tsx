import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { MdErrorOutline, MdExplore } from 'react-icons/md';
import i18n from '@/i18n';

/**
 * 폴백 UI는 에러가 난 트리를 대체하는 화면이므로, 실패 원인이 될 수 있는
 * ThemeProvider/styled 의존을 피하고 인라인 스타일만 사용한다.
 */
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '24px',
    textAlign: 'center' as const,
    fontFamily: "'Lato', 'Noto Sans KR', sans-serif",
    color: '#333d4b',
    backgroundColor: '#ffffff',
  },
  icon: { display: 'flex', color: '#8b95a1', marginBottom: '4px' },
  title: { fontSize: '20px', fontWeight: 800, margin: 0 },
  message: {
    fontSize: '15px',
    color: '#6b7684',
    margin: 0,
    maxWidth: '420px',
    lineHeight: 1.6,
  },
  button: {
    marginTop: '12px',
    padding: '12px 28px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#1db954',
    color: '#191f28',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  details: {
    marginTop: '20px',
    maxWidth: '90vw',
    overflowX: 'auto' as const,
    fontSize: '12px',
    color: '#8b95a1',
    textAlign: 'left' as const,
    whiteSpace: 'pre-wrap' as const,
  },
};

// i18n 초기화 전이거나 리소스 로드에 실패해도 빈 화면이 되지 않도록 기본값을 함께 넘긴다.
const translate = (key: string, fallback: string) => {
  try {
    return i18n.t(key, { defaultValue: fallback });
  } catch {
    return fallback;
  }
};

function FallbackScreen({ error }: { error?: unknown }) {
  const detail = error instanceof Error ? error.message : null;

  return (
    <div style={styles.container} role="alert">
      <div style={styles.icon} aria-hidden="true">
        <MdErrorOutline size={44} />
      </div>
      <h1 style={styles.title}>
        {translate('error.title', '문제가 발생했어요')}
      </h1>
      <p style={styles.message}>
        {translate(
          'error.message',
          '화면을 불러오는 중 오류가 생겼어요. 새로고침하면 대부분 해결됩니다.',
        )}
      </p>
      <button style={styles.button} onClick={() => window.location.reload()}>
        {translate('error.reload', '새로고침')}
      </button>
      {import.meta.env.DEV && detail && (
        <pre style={styles.details}>{detail}</pre>
      )}
    </div>
  );
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled render error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.error) {
      return <FallbackScreen error={this.state.error} />;
    }
    return this.props.children;
  }
}

/**
 * 라우터가 던진 에러(로더 실패, 지연 로드 실패 등)용 화면.
 * 지정하지 않으면 React Router의 개발자용 기본 에러 화면이 사용자에게 그대로 노출된다.
 */
export function RouteErrorFallback() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <div style={styles.container} role="alert">
        <div style={styles.icon} aria-hidden="true">
          <MdExplore size={44} />
        </div>
        <h1 style={styles.title}>
          {translate('error.notFoundTitle', '페이지를 찾을 수 없어요')}
        </h1>
        <p style={styles.message}>
          {translate(
            'error.notFoundMessage',
            '주소가 잘못되었거나 삭제된 페이지예요.',
          )}
        </p>
        <button style={styles.button} onClick={() => (window.location.href = '/')}>
          {translate('error.goHome', '홈으로 가기')}
        </button>
      </div>
    );
  }

  console.error('Route error:', error);
  return <FallbackScreen error={error} />;
}
