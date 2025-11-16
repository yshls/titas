/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    colors: {
      black: '#333333',

      transparent: 'transparent',
      current: 'currentColor',

      // 커스텀 색상들
      speaker1: '#C8F0EB',
      speaker2: '#FFF4CC',
      speaker3: '#DED9F2',
      speaker4: '#FFEAE0',
      primary: '#3A76F0',
    },
    extend: {},
  },
  plugins: [],
};
