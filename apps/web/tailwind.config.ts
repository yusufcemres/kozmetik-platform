import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f4',
          100: '#d9f0e3',
          200: '#b5e1c9',
          300: '#84cba8',
          400: '#51af83',
          500: '#2f9468',
          600: '#207753',
          700: '#1a5f44',
          800: '#174c38',
          900: '#143f2f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
