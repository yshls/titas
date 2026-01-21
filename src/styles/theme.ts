const colors = {
  // 브랜드
  primary: '#fe9800',
  primaryHover: '#fb8800',
  primaryLight: '#fff3e0',

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

  // 오렌지
  orange50: '#fff3e0',
  orange100: '#ffe0b0',
  orange200: '#ffcd80',
  orange300: '#ffbd51',
  orange400: '#ffa927',
  orange500: '#fe9800',
  orange600: '#fb8800',
  orange700: '#f57800',
  orange800: '#ed6700',
  orange900: '#e45600',

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

export const theme = {
  colors,
  background: '#FAFAFA',
  cardBg: '#FFFFFF',
  textMain: '#333d4b',
  textSub: '#6b7684',
  textDisabled: '#b0b8c1',
  border: '#e5e8eb',
};

export type ThemeType = typeof theme;
