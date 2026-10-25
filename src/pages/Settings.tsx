import {
  IconBookOpen,
  IconMonitor,
  IconMoon,
  IconRotateCcw,
  IconSun,
} from '../components/Icons';
import type { Bank, Settings as SettingsState, Theme } from '../types';

interface SettingsProps {
  bank: Bank;
  settings: SettingsState;
  onThemeChange: (theme: Theme) => void;
  onAutoNextChange: (enabled: boolean) => void;
  onReset: () => void;
}

const THEME_OPTIONS: {
  value: Theme;
  label: string;
  hint: string;
  icon: typeof IconSun;
}[] = [
  {
    value: 'system',
    label: '跟隨系統',
    hint: '依裝置外觀自動切換',
    icon: IconMonitor,
  },
  { value: 'light', label: '淺色', hint: '明亮背景', icon: IconSun },
  { value: 'dark', label: '深色', hint: '低光源環境', icon: IconMoon },
];

export function Settings({
  bank,
  settings,
  onThemeChange,
  onAutoNextChange,
  onReset,
}: SettingsProps) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-8 sm:pt-12">
      <div>
        <p className="eyebrow">Settings</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">設定</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          調整外觀與練習行為。所有紀錄只保存在這個瀏覽器。
        </p>
      </div>

      <section className="card mt-6 p-5 sm:p-6">
        <h2 className="text-base font-semibold">外觀</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          選擇網站主題，變更會立即套用。
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {THEME_OPTIONS.map(({ value, label, hint, icon: Icon }) => {
            const active = settings.theme === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onThemeChange(value)}
                aria-pressed={active}
                className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                  active
                    ? 'border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500/30'
                    : 'border-slate-200 hover:border-cyan-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-cyan-500/50 dark:hover:bg-slate-800/60'
                }`}
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                    active
                      ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{label}</span>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                    {hint}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="card mt-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">答對後自動下一題</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              答對後停留 1 秒顯示結果，再自動前往下一題。關閉後需手動按「下一題」。
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.autoNext}
            aria-label="答對後自動下一題"
            onClick={() => onAutoNextChange(!settings.autoNext)}
            className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${
              settings.autoNext
                ? 'bg-cyan-600 dark:bg-cyan-500'
                : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                settings.autoNext ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </section>

      <section className="card mt-4 p-5 sm:p-6">
        <h2 className="text-base font-semibold">資料</h2>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
          <div>
            <p className="text-sm font-semibold">重設所有進度</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              清除作答紀錄、錯題本與續練進度。題庫內容不會受影響。
            </p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-500/20 dark:text-rose-400"
          >
            <IconRotateCcw className="h-4 w-4" />
            重設進度
          </button>
        </div>
      </section>

      <section className="card mt-4 p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <IconBookOpen className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          <h2 className="text-base font-semibold">關於題庫</h2>
        </div>
        <dl className="mt-4 divide-y divide-slate-100 text-sm dark:divide-slate-800">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-slate-500 dark:text-slate-400">題庫名稱</dt>
            <dd className="text-right font-medium">{bank.meta.title}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-slate-500 dark:text-slate-400">題目數量</dt>
            <dd className="text-right font-medium">
              {bank.questions.length} 題
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-slate-500 dark:text-slate-400">題庫版本</dt>
            <dd className="text-right font-medium">v{bank.meta.version}</dd>
          </div>
          {bank.meta.updated && (
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-slate-500 dark:text-slate-400">更新日期</dt>
              <dd className="text-right font-medium">{bank.meta.updated}</dd>
            </div>
          )}
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-slate-500 dark:text-slate-400">進度儲存</dt>
            <dd className="text-right font-medium">瀏覽器 localStorage</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
