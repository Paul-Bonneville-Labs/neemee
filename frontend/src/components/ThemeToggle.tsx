'use client';

import { useTheme } from './ThemeProvider';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ];

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
        {theme === 'light' && <Sun className="w-5 h-5" />}
        {theme === 'dark' && <Moon className="w-5 h-5" />}
        {theme === 'system' && <Monitor className="w-5 h-5" />}
      </div>
      <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-36 p-2 shadow-lg border border-base-300">
        {themes.map(({ value, label, icon: Icon }) => (
          <li key={value}>
            <button
              onClick={() => setTheme(value)}
              className={`flex items-center gap-2 ${theme === value ? 'active' : ''}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Alternative compact version
export function ThemeToggleCompact() {
  const { theme, setTheme } = useTheme();

  const handleToggle = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <button
      onClick={handleToggle}
      className="btn btn-ghost btn-circle"
      title={`Current: ${theme} (click to cycle)`}
    >
      {theme === 'light' && <Sun className="w-5 h-5" />}
      {theme === 'dark' && <Moon className="w-5 h-5" />}
      {theme === 'system' && <Monitor className="w-5 h-5" />}
    </button>
  );
}