import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class', // This forces Tailwind to listen to App.tsx instead of the OS
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
