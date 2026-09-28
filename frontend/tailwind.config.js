/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        cinzel: ['Cinzel', 'serif'],
        mono: ['JetBrains Mono', 'DM Mono', 'monospace'],
      },
      colors: {
        campus: {
          dark: '#060709',
          cyan: '#38bdf8',
          amber: '#f59e0b',
          indigo: '#818cf8',
        }
      }
    }
  },
  plugins: []
}
