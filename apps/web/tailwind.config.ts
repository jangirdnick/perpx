import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sora: ['var(--font-sora)'],
        inter: ['var(--font-inter)'],
      },
    },
  },
  plugins: [],
};

export default config;
