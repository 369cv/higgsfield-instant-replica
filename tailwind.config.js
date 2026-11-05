/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./popup.html",
    "./sidepanel.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        lime: {
          DEFAULT: '#d1fe17',
          hover: '#bfee00',
          dim: 'rgba(209, 254, 23, 0.15)'
        },
        dark: {
          950: '#07080a',
          900: '#0b0c0e',
          850: '#121318',
          800: '#181920',
          750: '#1f212a',
          700: '#282b37',
          600: '#3a3e4e'
        },
        hf: {
          bg: '#0b0c0e',
          card: '#121318',
          border: '#23252e',
          textMuted: '#717684',
          textSecondary: '#9ea2ad'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      }
    },
  },
  plugins: [],
}
