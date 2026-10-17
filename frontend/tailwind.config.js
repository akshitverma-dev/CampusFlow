/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'DM Mono', 'monospace'],
      },
      colors: {
        brand: {
          lime: '#bbf246',
          limeHover: '#aee83b',
          limeDark: '#1a2708',
          limeBorder: '#8fc91c',
        },
        dark: {
          bg: '#111317',
          sidebar: '#16191f',
          card: '#1c2027',
          cardHover: '#222730',
          inner: '#232832',
          border: 'rgba(255, 255, 255, 0.07)',
        },
        light: {
          bg: '#eaedf2',
          sidebar: '#f1f4f8',
          card: '#ffffff',
          cardHover: '#f8fafc',
          inner: '#e8edf4',
          border: '#cbd5e1',
          borderDark: '#94a3b8',
        }
      }
    }
  },
  plugins: []
}
