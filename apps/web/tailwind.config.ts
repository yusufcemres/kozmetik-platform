import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // REVELA MD3 neutral earthy palette — CSS variable backed for dark mode
        primary: {
          DEFAULT: 'var(--color-primary)',
          dim: 'var(--color-primary-dim)',
          container: 'var(--color-primary-container)',
          fixed: 'var(--color-primary-fixed)',
          'fixed-dim': 'var(--color-primary-fixed-dim)',
        },
        'on-primary': 'var(--color-on-primary)',
        'on-primary-container': 'var(--color-on-primary-container)',
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          dim: 'var(--color-secondary-dim)',
          container: 'var(--color-secondary-container)',
          fixed: 'var(--color-secondary-fixed)',
          'fixed-dim': 'var(--color-secondary-fixed-dim)',
        },
        'on-secondary': 'var(--color-on-secondary)',
        'on-secondary-container': 'var(--color-on-secondary-container)',
        tertiary: {
          DEFAULT: 'var(--color-tertiary)',
          dim: 'var(--color-tertiary-dim)',
          container: 'var(--color-tertiary-container)',
          fixed: 'var(--color-tertiary-fixed)',
          'fixed-dim': 'var(--color-tertiary-fixed-dim)',
        },
        'on-tertiary': 'var(--color-on-tertiary)',
        'on-tertiary-container': 'var(--color-on-tertiary-container)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          bright: 'var(--color-surface-bright)',
          dim: 'var(--color-surface-dim)',
          'container-lowest': 'var(--color-surface-container-lowest)',
          'container-low': 'var(--color-surface-container-low)',
          container: 'var(--color-surface-container)',
          'container-high': 'var(--color-surface-container-high)',
          'container-highest': 'var(--color-surface-container-highest)',
          tint: 'var(--color-surface-tint)',
          variant: 'var(--color-surface-variant)',
        },
        'on-surface': 'var(--color-on-surface)',
        'on-surface-variant': 'var(--color-on-surface-variant)',
        'on-background': 'var(--color-on-background)',
        background: 'var(--color-background)',
        outline: {
          DEFAULT: 'var(--color-outline)',
          variant: 'var(--color-outline-variant)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          dim: 'var(--color-error-dim)',
          container: 'var(--color-error-container)',
        },
        'on-error': 'var(--color-on-error)',
        'on-error-container': 'var(--color-on-error-container)',
        'inverse-surface': 'var(--color-inverse-surface)',
        'inverse-on-surface': 'var(--color-inverse-on-surface)',
        'inverse-primary': 'var(--color-inverse-primary)',
        // Score colors (preserved for compatibility)
        score: {
          high: '#22c55e',
          'high-bg': 'var(--color-score-high-bg)',
          'high-border': 'var(--color-score-high-border)',
          medium: '#eab308',
          'medium-bg': 'var(--color-score-medium-bg)',
          'medium-border': 'var(--color-score-medium-border)',
          low: '#ef4444',
          'low-bg': 'var(--color-score-low-bg)',
          'low-border': 'var(--color-score-low-border)',
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
