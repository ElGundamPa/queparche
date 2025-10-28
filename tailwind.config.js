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
          DEFAULT: '#FF4444', // Rojo suave principal
          dim: '#CC3333', // Rojo más oscuro
          light: '#FF6666', // Rojo más claro
        },
        accent: '#FF4444', // Rojo suave para acentos
        bg: {
          DEFAULT: '#000000', // Negro puro
          soft: '#111111', // Negro suave
          card: '#1A1A1A', // Negro para tarjetas
        },
        text: {
          primary: '#FFFFFF', // Blanco para texto principal
          secondary: '#CCCCCC', // Gris claro para texto secundario
          muted: '#999999', // Gris para texto atenuado
        },
        danger: '#FF4444', // Rojo suave para peligro
        warning: '#FFA500', // Naranja para advertencias
        success: '#00FF00', // Verde para éxito
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