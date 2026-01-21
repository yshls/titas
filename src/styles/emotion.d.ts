import '@emotion/react';
// 테마 파일 경로 확인
import { theme } from '@/styles/theme';

type ThemeType = typeof theme;

declare module '@emotion/react' {
  export interface Theme extends ThemeType {}
}
