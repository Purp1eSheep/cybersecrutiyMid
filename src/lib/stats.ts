import type { Question, QuestionStat } from '../types';
import { chapterOf } from './questions';
import { emptyStat } from './storage';

export function applyResult(
  previous: QuestionStat | undefined,
  ok: boolean,
): QuestionStat {
  const base = previous ?? emptyStat();
  const consecutiveCorrect = ok ? base.consecutiveCorrect + 1 : 0;

  return {
    attempts: base.attempts + 1,
    correct: base.correct + (ok ? 1 : 0),
    wrongCount: base.wrongCount + (ok ? 0 : 1),
    consecutiveCorrect,
    // 進入錯題本後，要連續答對 2 次才會被移出。
    inWrongBook: ok ? base.inWrongBook && consecutiveCorrect < 2 : true,
    lastResult: ok,
  };
}

export function dateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function streakDays(
  activity: Record<string, number>,
  now = new Date(),
): number {
  const hasActivity = (date: Date) => (activity[dateKey(date)] ?? 0) > 0;
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 今天還沒開始刷題時，連續天數不應該立刻歸零。
  if (!hasActivity(cursor)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let streak = 0;
  while (hasActivity(cursor)) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function percent(correct: number, attempts: number): number {
  return attempts === 0 ? 0 : Math.round((correct / attempts) * 100);
}

export interface ChapterStat {
  chapter: string;
  total: number;
  answered: number;
  attempts: number;
  correct: number;
}

export interface OverallStat {
  total: number;
  answered: number;
  attempts: number;
  correct: number;
}

export function overallStats(
  questions: Question[],
  stats: Record<string, QuestionStat>,
): OverallStat {
  return questions.reduce<OverallStat>(
    (acc, question) => {
      const stat = stats[question.id];
      acc.total += 1;
      if ((stat?.attempts ?? 0) > 0) acc.answered += 1;
      acc.attempts += stat?.attempts ?? 0;
      acc.correct += stat?.correct ?? 0;
      return acc;
    },
    { total: 0, answered: 0, attempts: 0, correct: 0 },
  );
}

export function chapterStats(
  questions: Question[],
  stats: Record<string, QuestionStat>,
): ChapterStat[] {
  const map = new Map<string, ChapterStat>();

  for (const question of questions) {
    const chapter = chapterOf(question);
    const entry =
      map.get(chapter) ??
      ({ chapter, total: 0, answered: 0, attempts: 0, correct: 0 } as ChapterStat);

    const stat = stats[question.id];
    entry.total += 1;
    if ((stat?.attempts ?? 0) > 0) entry.answered += 1;
    entry.attempts += stat?.attempts ?? 0;
    entry.correct += stat?.correct ?? 0;
    map.set(chapter, entry);
  }

  return [...map.values()];
}
