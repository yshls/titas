const greyColors = {
  grey50: '#FAFAFA',
  grey100: '#DFDFDF',
  grey200: '#C5C5C5',
  grey300: '#ABABAB',
  grey400: '#909090',
  grey500: '#767676',
  grey600: '#5B5B5B',
  grey700: '#414141',
  grey800: '#262626',
  grey900: '#0C0C0C', // 원본 스와치
};

const greenColors = {
  green50: '#F8FCF9',
  green100: '#D5ECDA',
  green200: '#B1DCBA',
  green300: '#8ECD9B',
  green400: '#6ABD7C',
  green500: '#4BA95F', // 원본 스와치
  green600: '#3B864B',
  green700: '#2C6337',
  green800: '#1C3F24',
  green900: '#0D1C10',
};

const blueColors = {
  blue50: '#F5FDFF',
  blue100: '#DCF6FE',
  blue200: '#C3F0FD',
  blue300: '#A9EAFC',
  blue400: '#90E3FB',
  blue500: '#77DDFA', // 원본 스와치
  blue600: '#28C9F7',
  blue700: '#079BC6',
  blue800: '#045D76',
  blue900: '#011F27',
};

const amberColors = {
  amber50: '#FFFAF5',
  amber100: '#FFE9CF',
  amber200: '#FFD7AA',
  amber300: '#FEC684',
  amber400: '#FEB45F',
  amber500: '#FEA339', // 원본 스와치
  amber600: '#F28301',
  amber700: '#AF5F01',
  amber800: '#6C3A01',
  amber900: '#291600',
};

const brandColors = {
  brand50: '#F7F5FF',
  brand100: '#E4DFFE',
  brand200: '#D1C8FD',
  brand300: '#BEB2FC',
  brand400: '#AC9BFC',
  brand500: '#9985FB', // 원본 스와치
  brand600: '#5432F8',
  brand700: '#2807CE',
  brand800: '#18047B',
  brand900: '#080128',
};

const magentaColors = {
  magenta50: '#FCF6FC',
  magenta100: '#F6E3F6',
  magenta200: '#ECC7EC',
  magenta300: '#E0A7E0',
  magenta400: '#D285D2',
  magenta500: '#C264C2', // 원본 스와치 (5번째 화자 마젠타/오키드)
  magenta600: '#A948A9',
  magenta700: '#863286',
  magenta800: '#5D205D',
  magenta900: '#330E33',
};

const redColors = {
  red50: '#FFF5F5',
  red100: '#FFE1E0',
  red200: '#FFCDCB',
  red300: '#FFB8B7',
  red400: '#FFA4A2',
  red500: '#FF908D', // 원본 스와치
  red600: '#FF3A34',
  red700: '#DA0600',
  red800: '#820300',
  red900: '#290100',
};

const colors = {
  // 브랜드
  primary: brandColors.brand500,
  primaryHover: brandColors.brand600,
  primaryLight: brandColors.brand50,
  onPrimary: '#ffffff',

  accent: amberColors.amber500,
  onAccent: '#2d3136', // 밝은 톤이라 흰색보다 다크텍스트가 대비 좋음

  // 기능
  success: greenColors.green500,
  onSuccess: '#ffffff',
  error: redColors.red500,
  errorText: redColors.red700, // 텍스트/아이콘용으로는 500보다 진한 700이 가독성 좋음
  onError: '#ffffff',

  // 스케일 전체 (필요시 직접 참조)
  ...greyColors,
  ...greenColors,
  ...blueColors,
  ...amberColors,
  ...brandColors,
  ...magentaColors,
  ...redColors,
};

export const lightTheme = {
  colors,
  background: greyColors.grey50,
  cardBg: '#ffffff',
  textMain: greyColors.grey900,
  textSub: greyColors.grey500,
  textDisabled: greyColors.grey300,
  border: greyColors.grey200,
  borderSubtle: greyColors.grey100,
  mode: 'light' as 'light' | 'dark',
  // 화자 말풍선 — 각 컬러 패밀리의 파스텔(50~100) 단계에서 배경을,
  // 진한 단계(700)에서 텍스트를 가져와서 스케일과 정합성을 맞춤
  speaker: {
    speaker1: greenColors.green100,
    speaker2: blueColors.blue100,
    speaker3: amberColors.amber100,
    speaker4: redColors.red100,
    speaker5: magentaColors.magenta100,
    blue: blueColors.blue100,
    red: redColors.red100,
    green: greenColors.green100,
    amber: amberColors.amber100,
    purple: magentaColors.magenta100,
  },
  speakerText: {
    speaker1: greenColors.green700,
    speaker2: blueColors.blue700,
    speaker3: amberColors.amber700,
    speaker4: redColors.red700,
    speaker5: magentaColors.magenta700,
    blue: blueColors.blue700,
    red: redColors.red700,
    green: greenColors.green700,
    amber: amberColors.amber700,
    purple: magentaColors.magenta700,
    main: greyColors.grey900,
    sub: greyColors.grey500,
  },
};

export const darkTheme = {
  colors,
  background: '#1a1918',
  cardBg: '#242322',
  textMain: '#f2f1ed',
  textSub: greyColors.grey300,
  textDisabled: greyColors.grey600,
  border: greyColors.grey700,
  borderSubtle: '#2a2826',
  mode: 'dark' as 'light' | 'dark',
  // 다크모드 화자 배경은 각 컬러의 900(가장 어두운 단계)을,
  // 텍스트는 200(밝은 파스텔)을 사용해 어두운 배경 위 대비를 확보
  speaker: {
    speaker1: greenColors.green900,
    speaker2: blueColors.blue900,
    speaker3: amberColors.amber900,
    speaker4: redColors.red900,
    speaker5: magentaColors.magenta900,
    blue: blueColors.blue900,
    red: redColors.red900,
    green: greenColors.green900,
    amber: amberColors.amber900,
    purple: magentaColors.magenta900,
  },
  speakerText: {
    speaker1: greenColors.green200,
    speaker2: blueColors.blue200,
    speaker3: amberColors.amber200,
    speaker4: redColors.red200,
    speaker5: magentaColors.magenta200,
    blue: blueColors.blue200,
    red: redColors.red200,
    green: greenColors.green200,
    amber: amberColors.amber200,
    purple: magentaColors.magenta200,
    main: '#f2f1ed',
    sub: greyColors.grey300,
  },
};

export const theme = lightTheme;

export type Theme = typeof lightTheme;
export type ThemeType = Theme;