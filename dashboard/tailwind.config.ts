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
        accent: '#E50914',
        'accent-hover': '#F40612',
        'accent-dark': '#8B0000',
        muted: '#a0a0a0',
        line: '#262626',
        text: '#ededed',
        // akcenty platform (jak na GH0ST EMPIRE)
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
        glow: '0 0 25px rgba(229,9,20,0.35)',
        'glow-sm': '0 0 12px rgba(229,9,20,0.40)',
      },
    },
  },
  plugins: [],
} satisfies Config;
