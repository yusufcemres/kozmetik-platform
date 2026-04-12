'use client';

import { useTheme } from '@/components/providers/ThemeProvider';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const next = resolvedTheme === 'dark' ? 'light' : 'dark';

  return (
    <button
      onClick={() => setTheme(next)}
      aria-label={next === 'dark' ? 'Koyu temaya gec' : 'Acik temaya gec'}
      title={next === 'dark' ? 'Koyu tema' : 'Acik tema'}
      className="text-on-surface-variant hover:text-on-surface transition-colors"
    >
      <span className="material-icon material-icon-sm" aria-hidden="true">
        {resolvedTheme === 'dark' ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
}
