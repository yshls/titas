/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        primary: {
          DEFAULT: '#D4756B',
          hover: '#C26659',
        },

        // Background Colors
        background: {
          light: '#FAF0E6',
          dark: '#1A1714',
        },

        // Text Colors
        text: {
          light: {
            primary: '#1A1A1A',
            secondary: '#4A4A4A',
          },
          dark: {
            primary: '#E8E6E3',
            secondary: '#B8B6B3',
          },
        },

        // Speaker Colors
        speaker: {
          1: '#B8D4DB',
          2: '#C8D9B4',
          3: '#C4B5D5',
        },

        // Disabled Button Colors
        disabled: {
          light: '#D4C4B0',
          dark: '#3A3530',
        },

        // Border Colors
        border: {
          light: {
            primary: '#E0D4C8',
            secondary: '#EDE7DD',
            divider: '#F0E8DC',
          },
          dark: {
            primary: '#2D2621',
            secondary: '#252019',
            divider: '#221E19',
          },
        },
      },
    },
  },
  plugins: [],
};
