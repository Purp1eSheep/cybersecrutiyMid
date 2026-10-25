import { IconPlay, IconRepeat, IconShield } from '../components/Icons';
import { chapterOf } from '../lib/questions';
import type { Bank, QuestionStat, SessionConfig } from '../types';

interface WrongBookProps {
  bank: Bank;
  stats: Record<string, QuestionStat>;
  onStart: (config: SessionConfig) => void;
}

export function WrongBook({ bank, stats, onStart }: WrongBookProps) {
  const wrongQuestions = bank.questions.filter(
    (question) => stats[question.id]?.inWrongBook,
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-8 sm:pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Review</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">錯題本</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {wrongQuestions.length > 0
              ? `${wrongQuestions.length} 題待複習，連續答對 2 次才會移出。`
              : '答錯的題目會自動出現在這裡。'}
          </p>
        </div>

        <button
          type="button"
          disabled={wrongQuestions.length === 0}
          onClick={() =>
            onStart({
              mode: 'wrong',
              chapters: 'all',
              count: 'all',
              unattemptedOnly: false,
            })
          }
          className="btn-primary"
        >
          <IconPlay className="h-4 w-4" />
          開始錯題練習
        </button>
      </div>

      {wrongQuestions.length === 0 ? (
        <div className="card mt-6 flex flex-col items-center px-6 py-14 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <IconShield className="h-7 w-7" />
          </span>
          <p className="mt-4 font-semibold">目前沒有錯題</p>
          <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            先去刷一輪，答錯的題目就會被收進錯題本，之後可以在這裡集中複習。
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {wrongQuestions.map((question) => {
            const stat = stats[question.id];
            const consecutive = Math.min(stat?.consecutiveCorrect ?? 0, 2);

            return (
              <article key={question.id} className="card p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip">{chapterOf(question)}</span>
                  <span className="chip text-rose-600 dark:text-rose-300">
                    錯 {stat?.wrongCount ?? 0} 次
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <IconRepeat className="h-3.5 w-3.5" />
                    再答對 {Math.max(0, 2 - consecutive)} 次移出
                  </span>
                </div>

                <p className="mt-2 line-clamp-2 text-sm font-medium leading-relaxed">
                  {question.question}
                </p>

                <div className="mt-3 flex gap-1.5" aria-hidden="true">
                  {[0, 1].map((slot) => (
                    <span
                      key={slot}
                      className={`h-1.5 w-8 rounded-full ${
                        slot < consecutive
                          ? 'bg-emerald-500'
                          : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
