import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    // Add/remove Tailwind's `dark` class so components using dark: variants work
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('theme', theme);
    } catch {}
  }, [theme]);

  const toggle = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  return (
    <button
      type="button"
      aria-pressed={theme === 'dark'}
      title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={toggle}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-700 transition-all focus-visible:ring-2 focus-visible:ring-sky-500"
    >
      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      <span className="text-sm hidden md:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  );
}
