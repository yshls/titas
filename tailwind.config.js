/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#D4756B',
          hover: '#C26659',
        },
        speaker: {
          1: '#B8D4DB',
          2: '#C8D9B4',
          3: '#C4B5D5',
        },
      },
      backgroundColor: {
        primary: '#FAF0E6',
        'primary-dark': '#1A1714',
        disabled: '#D4C4B0',
        'disabled-dark': '#3A3530',
      },
      textColor: {
        primary: '#1A1A1A',
        secondary: '#4A4A4A',
        'primary-dark': '#E8E6E3',
        'secondary-dark': '#B8B6B3',
      },
      borderColor: {
        primary: '#E0D4C8',
        secondary: '#EDE7DD',
        divider: '#F0E8DC',
        'primary-dark': '#2D2621',
        'secondary-dark': '#252019',
        'divider-dark': '#221E19',
      },
    },
  },
  plugins: [],
};
