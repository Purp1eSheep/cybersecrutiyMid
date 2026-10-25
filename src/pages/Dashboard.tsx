import { useState } from 'react';
import {
  IconBarChart,
  IconCheck,
  IconChevronRight,
  IconFlame,
  IconListOrdered,
  IconPlay,
  IconRepeat,
  IconShuffle,
  IconTarget,
} from '../components/Icons';
import {
  chaptersOf,
  filterQuestions,
  MODE_LABEL,
} from '../lib/questions';
import { overallStats, percent, streakDays } from '../lib/stats';
import type {
  Bank,
  Mode,
  QuestionStat,
  Session,
  SessionConfig,
  View,
} from '../types';

const MODE_META: Record<
  Mode,
  { title: string; description: string; icon: typeof IconShuffle }
> = {
  random: {
    title: '隨機模式',
    description: '題目與選項打亂，模擬考試節奏',
    icon: IconShuffle,
  },
  sequential: {
    title: '順序模式',
    description: '照題庫原順序，適合第一次完整掃過',
    icon: IconListOrdered,
  },
  wrong: {
    title: '錯題本',
    description: '只練尚未記住的錯題，連續答對 2 次移出',
    icon: IconRepeat,
  },
};

const COUNT_OPTIONS: { value: number | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 10, label: '10 題' },
  { value: 20, label: '20 題' },
  { value: 30, label: '30 題' },
];

interface DashboardProps {
  bank: Bank;
  stats: Record<string, QuestionStat>;
  activity: Record<string, number>;
  session: Session | null;
  onStart: (config: SessionConfig) => void;
  onResume: () => void;
  onNavigate: (view: View) => void;
}

export function Dashboard({
  bank,
  stats,
  activity,
  session,
  onStart,
  onResume,
  onNavigate,
}: DashboardProps) {
  const [mode, setMode] = useState<Mode>('random');
  const [chapters, setChapters] = useState<string[] | 'all'>('all');
  const [count, setCount] = useState<number | 'all'>('all');
  const [unattemptedOnly, setUnattemptedOnly] = useState(false);

  const allChapters = chaptersOf(bank);
  const available = filterQuestions(
    bank.questions,
    { mode, chapters, unattemptedOnly },
    stats,
  ).length;
  const planned = count === 'all' ? available : Math.min(count, available);

  const wrongCount = bank.questions.filter(
    (question) => stats[question.id]?.inWrongBook,
  ).length;
  const overall = overallStats(bank.questions, stats);
  const accuracy = percent(overall.correct, overall.attempts);
  const streak = streakDays(activity);

  const resumable =
    session !== null && session.index < session.queue.length ? session : null;

  function toggleChapter(chapter: string) {
    setChapters((previous) => {
      const base = previous === 'all' ? allChapters : previous;
      const next = base.includes(chapter)
        ? base.filter((item) => item !== chapter)
        : [...base, chapter];

      if (next.length === 0 || next.length === allChapters.length) return 'all';
      return next;
    });
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-16 pt-8 sm:pt-12">
      <section>
        <p className="eyebrow">Midterm Review</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          今天要刷幾題？
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {bank.meta.title} · {bank.questions.length} 題 · 版本{' '}
          {bank.meta.version}
          {bank.meta.updated ? ` · 更新於 ${bank.meta.updated}` : ''}
        </p>
      </section>

      {resumable && (
        <button
          type="button"
          onClick={onResume}
          className="card mt-6 flex w-full items-center gap-4 p-4 text-left transition hover:border-cyan-400/70 hover:shadow-md sm:p-5"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">
            <IconPlay className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold text-cyan-700 dark:text-cyan-400">
              繼續上次練習
            </span>
            <span className="mt-0.5 block truncate text-sm font-medium">
              {MODE_LABEL[resumable.mode]} · 第 {resumable.index + 1} /{' '}
              {resumable.queue.length} 題
            </span>
          </span>
          <IconChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
        </button>
      )}

      <section className="card mt-4 p-5 sm:p-6">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-base font-semibold">開始新一輪</h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            符合條件 {available} 題
          </span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {(Object.keys(MODE_META) as Mode[]).map((key) => {
            const meta = MODE_META[key];
            const selected = mode === key;
            const Icon = meta.icon;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={selected}
                onClick={() => setMode(key)}
                className={`rounded-2xl border p-4 text-left transition ${
                  selected
                    ? 'border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500/30'
                    : 'border-slate-200 bg-white hover:border-cyan-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-cyan-500/50'
                }`}
              >
                <span
                  className={`grid h-9 w-9 place-items-center rounded-xl ${
                    selected
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="mt-3 block text-sm font-semibold">
                  {meta.title}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {meta.description}
                </span>
              </button>
            );
          })}
        </div>

        {mode === 'wrong' && wrongCount === 0 && (
          <p className="mt-3 rounded-xl bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
            錯題本目前是空的。先做一輪練習，答錯的題目就會出現在這裡。
          </p>
        )}

        <div className="mt-6">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-sm font-semibold">章節範圍</h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {chapters === 'all' ? '全部章節混合' : `已選 ${chapters.length} 章`}
            </span>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setChapters('all')}
              aria-pressed={chapters === 'all'}
              className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
                chapters === 'all'
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300'
                  : 'border-slate-200 text-slate-600 hover:border-cyan-300 dark:border-slate-700 dark:text-slate-300 dark:hover:border-cyan-500/50'
              }`}
            >
              全部章節（混合）
            </button>
            {allChapters.map((chapter) => {
              const selected =
                chapters !== 'all' && chapters.includes(chapter);
              return (
                <button
                  key={chapter}
                  type="button"
                  onClick={() => toggleChapter(chapter)}
                  aria-pressed={selected}
                  className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
                    selected
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300'
                      : 'border-slate-200 text-slate-600 hover:border-cyan-300 dark:border-slate-700 dark:text-slate-300 dark:hover:border-cyan-500/50'
                  }`}
                >
                  {chapter}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold">本輪題數</h3>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {COUNT_OPTIONS.map((option) => (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => setCount(option.value)}
                  aria-pressed={count === option.value}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    count === option.value
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300'
                      : 'border-slate-200 text-slate-600 hover:border-cyan-300 dark:border-slate-700 dark:text-slate-300 dark:hover:border-cyan-500/50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setUnattemptedOnly((value) => !value)}
            aria-pressed={unattemptedOnly}
            className="flex items-center gap-2.5 self-start rounded-xl px-1 py-1 text-sm font-medium text-slate-600 dark:text-slate-300"
          >
            <span
              className={`grid h-5 w-5 place-items-center rounded-md border transition ${
                unattemptedOnly
                  ? 'border-cyan-500 bg-cyan-500 text-slate-950'
                  : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900'
              }`}
            >
              {unattemptedOnly && <IconCheck className="h-3.5 w-3.5" />}
            </span>
            只練未作答的題目
          </button>
        </div>

        <button
          type="button"
          onClick={() =>
            onStart({ mode, chapters, count, unattemptedOnly })
          }
          disabled={available === 0}
          className="btn-primary mt-6 w-full py-3.5 text-base"
        >
          <IconPlay className="h-5 w-5" />
          開始練習 · {planned} 題
        </button>
      </section>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onNavigate('wrong')}
          className="card flex items-center gap-4 p-5 text-left transition hover:border-rose-400/60 hover:shadow-md"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-rose-500/10 text-rose-500">
            <IconRepeat className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">錯題本</span>
            <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">
              {wrongCount > 0 ? `${wrongCount} 題待複習` : '目前沒有錯題'}
            </span>
          </span>
          <IconChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
        </button>

        <button
          type="button"
          onClick={() => onNavigate('stats')}
          className="card flex items-center gap-4 p-5 text-left transition hover:border-cyan-400/60 hover:shadow-md"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <IconBarChart className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-semibold">學習統計</span>
            <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1">
                <IconTarget className="h-3.5 w-3.5" />
                {overall.attempts > 0 ? `${accuracy}% 正確率` : '尚未開始'}
              </span>
              <span className="inline-flex items-center gap-1">
                <IconFlame className="h-3.5 w-3.5" />
                連續 {streak} 天
              </span>
            </span>
          </span>
          <IconChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
        </button>
      </div>

      <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
        進度只存在這台裝置的瀏覽器，換裝置或清除網站資料後不會保留。
      </p>
    </main>
  );
}
