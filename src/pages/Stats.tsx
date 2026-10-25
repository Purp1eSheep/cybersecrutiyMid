import {
  IconBarChart,
  IconBookOpen,
  IconFlame,
  IconRepeat,
  IconTarget,
} from '../components/Icons';
import {
  chapterStats,
  overallStats,
  percent,
  streakDays,
} from '../lib/stats';
import type { Bank, QuestionStat } from '../types';

interface StatsProps {
  bank: Bank;
  stats: Record<string, QuestionStat>;
  activity: Record<string, number>;
}

export function Stats({ bank, stats, activity }: StatsProps) {
  const overall = overallStats(bank.questions, stats);
  const chapters = chapterStats(bank.questions, stats);
  const wrongCount = bank.questions.filter(
    (question) => stats[question.id]?.inWrongBook,
  ).length;
  const accuracy = percent(overall.correct, overall.attempts);
  const streak = streakDays(activity);

  const tiles = [
    {
      label: '總正確率',
      value: overall.attempts > 0 ? `${accuracy}%` : '—',
      hint:
        overall.attempts > 0
          ? `${overall.correct} / ${overall.attempts} 次作答`
          : '尚未作答',
      icon: IconTarget,
      tone: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    },
    {
      label: '已作答題數',
      value: `${overall.answered}`,
      hint: `題庫共 ${overall.total} 題`,
      icon: IconBookOpen,
      tone: 'bg-slate-500/10 text-slate-600 dark:text-slate-300',
    },
    {
      label: '錯題本',
      value: `${wrongCount}`,
      hint: wrongCount > 0 ? '待複習' : '沒有錯題',
      icon: IconRepeat,
      tone: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    },
    {
      label: '連續練習',
      value: `${streak}`,
      hint: '天',
      icon: IconFlame,
      tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
  ];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-16 pt-8 sm:pt-12">
      <div>
        <p className="eyebrow">Progress</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">學習統計</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          以每題的作答紀錄累計，重設進度後會全部歸零。
        </p>
      </div>

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map(({ label, value, hint, icon: Icon, tone }) => (
          <div key={label} className="card p-4 sm:p-5">
            <span
              className={`grid h-9 w-9 place-items-center rounded-xl ${tone}`}
            >
              <Icon className="h-[18px] w-[18px]" />
            </span>
            <p className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              {value}
            </p>
            <p className="text-xs font-semibold">{label}</p>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              {hint}
            </p>
          </div>
        ))}
      </section>

      <section className="card mt-4 p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <IconBarChart className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          <h2 className="text-base font-semibold">章節表現</h2>
        </div>

        <div className="mt-5 space-y-5">
          {chapters.map((chapter) => {
            const chapterAccuracy = percent(chapter.correct, chapter.attempts);
            return (
              <div key={chapter.chapter}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className="text-sm font-medium">
                    {chapter.chapter}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {chapter.attempts > 0
                      ? `${chapterAccuracy}% 正確率`
                      : '未作答'}{' '}
                    · {chapter.answered}/{chapter.total} 題
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-cyan-500 transition-all"
                    style={{ width: `${chapterAccuracy}%` }}
                  />
                </div>
              </div>
            );
          })}

          {chapters.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              題庫目前沒有章節資料。
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
