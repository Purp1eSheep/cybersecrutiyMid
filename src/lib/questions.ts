import type {
  Bank,
  Mode,
  Question,
  QuestionStat,
  SessionConfig,
} from '../types';

export const MODE_LABEL: Record<Mode, string> = {
  sequential: '順序模式',
  random: '隨機模式',
  wrong: '錯題本',
};

export function chapterOf(question: Question): string {
  return question.chapter?.trim() || '未分類';
}

const SOURCE_PATTERN = /Chapter[_\s-]*(\d+)\.md\s*題號\s*(\d+)/i;

export function formatSource(source?: string): string | null {
  if (!source) return null;
  const match = source.match(SOURCE_PATTERN);
  if (!match) return source;
  return `Chapter ${match[1]} · 第 ${match[2]} 題`;
}

export function chaptersOf(bank: Bank): string[] {
  const chapters: string[] = [];
  for (const question of bank.questions) {
    const chapter = chapterOf(question);
    if (!chapters.includes(chapter)) chapters.push(chapter);
  }
  return chapters;
}

export function indexQuestions(questions: Question[]): Map<string, Question> {
  return new Map(questions.map((question) => [question.id, question]));
}

export function filterQuestions(
  questions: Question[],
  config: Pick<SessionConfig, 'mode' | 'chapters' | 'unattemptedOnly'>,
  stats: Record<string, QuestionStat>,
): Question[] {
  return questions.filter((question) => {
    if (config.mode === 'wrong' && !stats[question.id]?.inWrongBook) {
      return false;
    }
    if (
      config.chapters !== 'all' &&
      !config.chapters.includes(chapterOf(question))
    ) {
      return false;
    }
    if (config.unattemptedOnly && (stats[question.id]?.attempts ?? 0) > 0) {
      return false;
    }
    return true;
  });
}

export function limitQuestions<T>(items: T[], count: number | 'all'): T[] {
  return count === 'all' ? items : items.slice(0, count);
}
