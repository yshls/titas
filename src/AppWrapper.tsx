import { ThemeProvider } from '@emotion/react';
import { useAppStore, type AppState } from '@/store/appStore';
import { lightTheme, darkTheme } from '@/styles/theme';
import type { ReactNode } from 'react';

export function AppWrapper({ children }: { children: ReactNode }) {
  const themeMode = useAppStore((state: AppState) => state.themeMode);
  const currentTheme = themeMode === 'dark' ? darkTheme : lightTheme;

  return <ThemeProvider theme={currentTheme}>{children}</ThemeProvider>;
}
