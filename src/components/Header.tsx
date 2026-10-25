import type { Theme, View } from '../types';
import {
  IconBarChart,
  IconBookOpen,
  IconRepeat,
  IconSettings,
  IconShield,
} from './Icons';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  view: View;
  theme: Theme;
  practicing: boolean;
  onNavigate: (view: View) => void;
  onThemeChange: (theme: Theme) => void;
}

const NAV: { view: View; label: string; icon: typeof IconBookOpen }[] = [
  { view: 'dashboard', label: '首頁', icon: IconBookOpen },
  { view: 'wrong', label: '錯題', icon: IconRepeat },
  { view: 'stats', label: '統計', icon: IconBarChart },
  { view: 'settings', label: '設定', icon: IconSettings },
];

export function Header({
  view,
  theme,
  practicing,
  onNavigate,
  onThemeChange,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-slate-50/85 backdrop-blur-lg dark:border-slate-800/70 dark:bg-slate-950/85">
      <div className="mx-auto flex max-w-4xl items-center gap-2 px-4 py-3">
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="flex min-w-0 items-center gap-2.5"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/30">
            <IconShield className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <span className="hidden truncate text-[15px] font-semibold tracking-tight sm:inline">
            Midterm<span className="hidden sm:inline"> Review</span>
          </span>
        </button>

        {!practicing && (
          <nav className="ml-auto flex items-center gap-1 rounded-xl bg-slate-200/60 p-1 dark:bg-slate-800/60">
            {NAV.map(({ view: target, label, icon: Icon }) => {
              const active = view === target;
              return (
                <button
                  key={target}
                  type="button"
                  onClick={() => onNavigate(target)}
                  aria-label={label}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition sm:px-3 ${
                    active
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              );
            })}
          </nav>
        )}

        <div className={practicing ? 'ml-auto' : ''}>
          <ThemeToggle theme={theme} onChange={onThemeChange} />
        </div>
      </div>
    </header>
  );
}
