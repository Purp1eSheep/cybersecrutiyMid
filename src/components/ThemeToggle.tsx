import type { Theme } from '../types';
import { IconMonitor, IconMoon, IconSun } from './Icons';

const LABELS: Record<Theme, string> = {
  system: '跟隨系統',
  light: '淺色',
  dark: '深色',
};

const NEXT: Record<Theme, Theme> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
};

interface ThemeToggleProps {
  theme: Theme;
  onChange: (theme: Theme) => void;
}

export function ThemeToggle({ theme, onChange }: ThemeToggleProps) {
  const Icon =
    theme === 'system' ? IconMonitor : theme === 'light' ? IconSun : IconMoon;

  return (
    <button
      type="button"
      onClick={() => onChange(NEXT[theme])}
      title={`主題：${LABELS[theme]}（點擊切換）`}
      aria-label={`主題：${LABELS[theme]}，點擊切換`}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-cyan-400 hover:text-cyan-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-cyan-500/60 dark:hover:text-cyan-400"
    >
      <Icon className="h-[18px] w-[18px]" />
    </button>
  );
}
