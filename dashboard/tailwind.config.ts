import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0a',
        surface: '#141414',
        card: '#171717',
        elevated: '#232323',
        accent: 'rgb(var(--accent-rgb) / <alpha-value>)',
        'accent-hover': 'rgb(var(--accent-hover-rgb) / <alpha-value>)',
        'accent-dark': 'rgb(var(--accent-dark-rgb) / <alpha-value>)',
        muted: '#a0a0a0',
        line: '#262626',
        text: '#ededed',
        // akcenty platform (stałe)
        discord: '#5865F2',
        twitch: '#9146FF',
        kick: '#53FC18',
        youtube: '#FF0000',
      },
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'Segoe UI', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 18px rgb(var(--accent-rgb) / 0.22)',
        'glow-sm': '0 0 10px rgb(var(--accent-rgb) / 0.28)',
      },
    },
  },
  plugins: [],
} satisfies Config;
