import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'auto';

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    // auto: follow system
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) || 'light'
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Keep auto in sync if system preference changes
  useEffect(() => {
    if (theme !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('auto');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  function setTheme(next: Theme) {
    localStorage.setItem('theme', next);
    setThemeState(next);
  }

  return { theme, setTheme };
}

// Call once at app start to apply saved theme before first render
export function initTheme() {
  const saved = (localStorage.getItem('theme') as Theme) || 'light';
  applyTheme(saved);
}
