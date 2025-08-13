/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6C5CE7',
          dim: '#5646C2',
          light: '#8B7CFF',
        },
        accent: '#00D1B2',
        bg: {
          DEFAULT: '#0B0B0F',
          soft: '#111118',
          card: '#151522',
        },
        text: {
          primary: '#F3F4F6',
          secondary: '#C7CBD1',
          muted: '#9AA0A6',
        },
        danger: '#EF4444',
        warning: '#F59E0B',
        success: '#10B981',
      },
      fontFamily: {
        display: ['Poppins_700Bold', 'System'],
        sans: ['Inter_400Regular', 'System'],
        medium: ['Inter_500Medium', 'System'],
        semibold: ['Inter_600SemiBold', 'System'],
      },
      borderRadius: {
        xl: '14px',
        '2xl': '22px',
      },
      spacing: {
        13: '3.25rem',
      },
      boxShadow: {
        card: '0 8px 28px rgba(0,0,0,0.35)',
        soft: '0 6px 16px rgba(0,0,0,0.25)',
      },
    },
  },
  plugins: [],
};