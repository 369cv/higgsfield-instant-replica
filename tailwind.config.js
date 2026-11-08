/** @type {import('tailwindcss').Config} */

// Colours read CSS variables (see src/index.css) so the whole UI can switch
// between dark and light themes. `white` and `neutral-*` are remapped too, so
// existing `text-white`, `bg-white/5`, `text-neutral-400` etc. flip automatically.
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`;

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
        white: v('fg'),
        neutral: {
          50: v('n-50'),
          100: v('n-100'),
          200: v('n-200'),
          300: v('n-300'),
          400: v('n-400'),
          500: v('n-500'),
          600: v('n-600'),
          700: v('n-700'),
          800: v('n-800'),
          900: v('n-900'),
          950: v('n-950'),
        },
        canvas: v('canvas'),   // page background
        base: v('base'),       // bars, sidebars, sheets
        surface: v('surface'), // cards, grouped lists, inputs
        line: v('line'),       // strong borders / elevated fills
        muted: v('muted'),     // tertiary text
        soft: v('soft'),       // secondary text
        'accent-ink': v('accent-ink'), // lime as text (darker in light mode)
        lime: {
          DEFAULT: '#d1fe17',
          hover: '#bfee00',
          dim: 'rgba(209, 254, 23, 0.15)'
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      }
    },
  },
  plugins: [],
}
