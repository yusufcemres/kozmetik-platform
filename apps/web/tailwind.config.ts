import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // REVELA MD3 neutral earthy palette
        primary: {
          DEFAULT: '#1a1a1a',
          dim: '#111111',
          container: '#e5e2e1',
          fixed: '#e5e2e1',
          'fixed-dim': '#d7d4d3',
        },
        'on-primary': '#faf7f6',
        'on-primary-container': '#525151',
        secondary: {
          DEFAULT: '#605f5e',
          dim: '#545352',
          container: '#e5e2e0',
          fixed: '#e5e2e0',
          'fixed-dim': '#d7d4d2',
        },
        'on-secondary': '#fbf8f7',
        'on-secondary-container': '#525151',
        tertiary: {
          DEFAULT: '#625f55',
          dim: '#56534a',
          container: '#faf3e6',
          fixed: '#faf3e6',
          'fixed-dim': '#ebe5d8',
        },
        'on-tertiary': '#fff8ec',
        'on-tertiary-container': '#5f5b52',
        surface: {
          DEFAULT: '#faf9f7',
          bright: '#faf9f7',
          dim: '#d6dbd7',
          'container-lowest': '#ffffff',
          'container-low': '#f3f4f1',
          container: '#edeeeb',
          'container-high': '#e6e9e6',
          'container-highest': '#e0e3e0',
          tint: '#1a1a1a',
          variant: '#e0e3e0',
        },
        'on-surface': '#2f3331',
        'on-surface-variant': '#5c605d',
        'on-background': '#2f3331',
        background: '#faf9f7',
        outline: {
          DEFAULT: '#777c79',
          variant: '#afb3b0',
        },
        error: {
          DEFAULT: '#9f403d',
          dim: '#4e0309',
          container: '#fe8983',
        },
        'on-error': '#fff7f6',
        'on-error-container': '#752121',
        'inverse-surface': '#0d0e0e',
        'inverse-on-surface': '#9d9d9b',
        'inverse-primary': '#ffffff',
        // Score colors (preserved for compatibility)
        score: {
          high: '#22c55e',
          'high-bg': '#f0fdf4',
          'high-border': '#bbf7d0',
          medium: '#eab308',
          'medium-bg': '#fefce8',
          'medium-border': '#fef08a',
          low: '#ef4444',
          'low-bg': '#fef2f2',
          'low-border': '#fecaca',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        headline: ['Manrope', 'system-ui', 'sans-serif'],
        body: ['Manrope', 'system-ui', 'sans-serif'],
        label: ['Manrope', 'system-ui', 'sans-serif'],
        // Admin fallback
        admin: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        none: '0',
        sm: '0.125rem',
        DEFAULT: '0.125rem',
        md: '0.25rem',
        lg: '0.25rem',
        xl: '0.5rem',
        '2xl': '0.75rem',
        full: '9999px',
      },
      aspectRatio: {
        '3/4': '3 / 4',
        '4/5': '4 / 5',
      },
      gridTemplateColumns: {
        'editorial': 'repeat(12, 1fr)',
      },
    },
  },
  plugins: [],
};

export default config;
