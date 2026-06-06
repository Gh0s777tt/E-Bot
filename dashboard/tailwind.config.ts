import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0b0b0b',
        surface: '#141414',
        card: '#181818',
        elevated: '#232323',
        accent: '#E50914',
        'accent-hover': '#F40612',
        muted: '#B3B3B3',
        line: '#2A2A2A',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(229,9,20,0.25), 0 8px 30px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
} satisfies Config;
