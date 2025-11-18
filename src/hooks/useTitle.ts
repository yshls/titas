import { useEffect } from 'react';

/**
 * 브라우저 탭 제목 변경
 * @param title - 표시할 제목
 */

export function useTitle(title: string) {
  useEffect(() => {
    document.title = `${title} - TiTaS`;

    // 컴포넌트 언마운트 시 기본 제목 복구
    return () => {
      document.title = 'TiTaS';
    };
  }, [title]);
}
