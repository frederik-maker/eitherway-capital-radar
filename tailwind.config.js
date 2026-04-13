/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        graphite: {
          950: '#08080B',
          900: '#0B0B0F',
          800: '#131317',
          700: '#1C1C22',
          600: '#282830',
          500: '#3A3A44',
          400: '#52525E',
        },
        cream: {
          50: '#FDFCFA',
          100: '#F5F0EB',
          200: '#EDE7E0',
          300: '#D9D3CC',
          400: '#B8B2AB',
          500: '#8A847D',
        },
        acid: {
          DEFAULT: '#CDFF00',
          50: '#F5FFD6',
          100: '#EBFFAD',
          200: '#DEFF7A',
          300: '#D8FF33',
          400: '#CDFF00',
          500: '#B8E600',
          600: '#A3CC00',
          700: '#7A9900',
        },
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
