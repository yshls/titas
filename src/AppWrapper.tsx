import { ThemeProvider } from '@emotion/react';
import { useAppStore } from '@/store/appStore';
import { lightTheme, darkTheme } from '@/styles/theme';
import type { ReactNode } from 'react';

export function AppWrapper({ children }: { children: ReactNode }) {
  const themeMode = useAppStore((state) => state.themeMode);
  const currentTheme = themeMode === 'dark' ? darkTheme : lightTheme;

  return <ThemeProvider theme={currentTheme}>{children}</ThemeProvider>;
}
