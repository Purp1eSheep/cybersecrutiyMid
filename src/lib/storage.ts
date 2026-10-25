import type { QuestionStat, StoredState, Theme } from '../types';

export const STORAGE_KEY = 'midterm-review:v1';

export function emptyStat(): QuestionStat {
  return {
    attempts: 0,
    correct: 0,
    wrongCount: 0,
    consecutiveCorrect: 0,
    inWrongBook: false,
    lastResult: null,
  };
}

function isTheme(value: unknown): value is Theme {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function loadState(): StoredState {
  const fallback: StoredState = {
    version: 1,
    stats: {},
    activity: {},
    lastSession: null,
    settings: { theme: 'dark', autoNext: true },
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as Partial<StoredState>;
    return {
      version: 1,
      stats: parsed.stats ?? {},
      activity: parsed.activity ?? {},
      lastSession: parsed.lastSession ?? null,
      settings: {
        theme: isTheme(parsed.settings?.theme) ? parsed.settings.theme : 'dark',
        autoNext:
          typeof parsed.settings?.autoNext === 'boolean'
            ? parsed.settings.autoNext
            : true,
      },
    };
  } catch {
    return fallback;
  }
}

export function saveState(state: StoredState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable (private mode, quota). The app still works in memory.
  }
}

export function applyTheme(theme: Theme): void {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = theme === 'dark' || (theme === 'system' && prefersDark);
  document.documentElement.classList.toggle('dark', dark);
}
