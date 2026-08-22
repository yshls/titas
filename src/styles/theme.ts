const colors = {
  // 브랜드
  primary: '#1db954',
  primaryHover: '#1aa34a',
  primaryLight: '#f1fbf5',
  /*
   * primary 위에 얹는 글자색. 밝은 그린이라 흰 글자는 대비가 2.59로 기준(4.5)에
   * 못 미치지만, 진한 글자를 쓰면 6.4로 통과한다.
   */
  onPrimary: '#191f28',

  // 기능
  success: '#3182f6',
  error: '#f04452',

  // 그레이
  grey50: '#f9fafb',
  grey100: '#f2f4f6',
  grey200: '#e5e8eb',
  grey300: '#d1d6db',
  grey400: '#b0b8c1',
  grey500: '#8b95a1',
  grey600: '#6b7684',
  grey700: '#4e5968',
  grey800: '#333d4b',
  grey900: '#191f28',

  // 브랜드 그린 스케일
  brand50: '#f1fbf5',
  brand100: '#dbf4e4',
  brand200: '#b2e7c5',
  brand300: '#80d89f',
  brand400: '#4fc87a',
  brand500: '#1db954',
  brand600: '#1aa34a',
  brand700: '#15893e',
  brand800: '#116f32',
  brand900: '#0e5928',

  // 블루
  blue50: '#e8f3ff',
  blue100: '#c9e2ff',
  blue200: '#90c2ff',
  blue300: '#64a8ff',
  blue400: '#4593fc',
  blue500: '#3182f6',
  blue600: '#2272eb',
  blue700: '#1b64da',
  blue800: '#1957c2',
  blue900: '#194aa6',

  // 레드
  red50: '#ffeeee',
  red100: '#ffd4d6',
  red200: '#feafb4',
  red300: '#fb8890',
  red400: '#f66570',
  red500: '#f04452',
  red600: '#e42939',
  red700: '#d22030',
  red800: '#bc1b2a',
  red900: '#a51926',

  // 그린
  green50: '#f0faf6',
  green100: '#aeefd5',
  green200: '#76e4b8',
  green300: '#3fd599',
  green400: '#15c47e',
  green500: '#03b26c',
  green600: '#02a262',
  green700: '#029359',
  green800: '#028450',
  green900: '#027648',
};

export const lightTheme = {
  colors,
  background: '#FAFAFA',
  cardBg: '#FFFFFF',
  textMain: '#333d4b',
  textSub: '#4e5968', // grey700 for WCAG AA (4.5:1+)
  textDisabled: '#b0b8c1',
  border: '#e5e8eb',
  mode: 'light' as const,
  // 화자 말풍선 배경 및 텍스트 (Light Mode)
  speaker: {
    blue: '#e8f3ff',
    red: '#ffeeee',
    green: '#f0faf6',
    amber: '#fff8e1',
    purple: '#f3e5f5',
    // 하위 호환성
    blue50: '#e8f3ff',
    red50: '#ffeeee',
    green50: '#f0faf6',
    amber50: '#fff8e1',
    purple50: '#f3e5f5',
  },
  speakerText: {
    blue: '#1e3a8a',
    red: '#881337',
    green: '#064e3b',
    amber: '#78350f',
    purple: '#581c87',
    main: '#191f28',
    sub: '#4e5968',
  },
};

export const darkTheme = {
  colors,
  background: '#1a1a1a',
  cardBg: '#242424',
  textMain: '#d4d4d4',
  textSub: '#9ca3af',
  textDisabled: '#6b7280',
  border: '#333333',
  mode: 'dark' as const,
  // 화자 말풍선 배경 및 텍스트 (Dark Mode: #1a1a1a 위 눈부심 제거 및 WCAG AA/AAA 대비 충족)
  speaker: {
    blue: '#1a2736',
    red: '#351c22',
    green: '#152b22',
    amber: '#302412',
    purple: '#281a36',
    // 하위 호환성
    blue50: '#1a2736',
    red50: '#351c22',
    green50: '#152b22',
    amber50: '#302412',
    purple50: '#281a36',
  },
  speakerText: {
    blue: '#93c5fd',
    red: '#fda4af',
    green: '#6ee7b7',
    amber: '#fcd34d',
    purple: '#d8b4fe',
    main: '#f3f4f6',
    sub: '#9ca3af',
  },
};

// 하위 호환성을 위해 lightTheme을 기본 theme으로 export
export const theme = lightTheme;

export type Theme = typeof lightTheme;
export type ThemeType = Theme;